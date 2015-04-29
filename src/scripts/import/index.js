/*jshint -W083 */
//todo: PM: remove hint once tests are written

var Backbone = require('./../core/backbone.js');
var Column = require('./../charting/Column.js');
var DataTypes = require('./../charting/DataTypes.js');
var Axis = require('./../charting/Axis.js');
var transform = require('./../transform/index.js');
var predictedDateFormat = require('./predictDateFormat.js');
var ValidateFile = require('./validateFile.js');

function gtDateThreshold(count, totalNonDateStrings) {
    return count * 100 / totalNonDateStrings > 95;
}

var Threshold = function (numRows) {
    var percent = 95;
    var s = 100 / numRows;
    var almost = numRows - 1;
    this.isAbove = function (count) {
        return (count >= almost) || (count * s > percent);
    };
    return this;
};

var DataImport = Backbone.Model.extend({

    defaults: {
        type: '',
        hasHeaderRow: true,
        dataAsString: '',
        numRows: 0,
        numCols: 0,
        colNames: [],
        pipelineOptions: null,
        warning: {
            message: null,
            rows: []
        },
        data: [],
        originalData: []
    },

    columns: null,

    initialize: function () {
        this.columns = new Backbone.Collection();
        this.listenTo(this, 'invalid', this.discardData);
    },

    validate: function (attributes, options) {

        var xAxis;
        var file = new ValidateFile(attributes);
        if (file.error.message) return file.error;
        var data = file.data;
        var dataTypeCounters = file.dataTypeCounters;

        var threshold = new Threshold(file.numRows);

        dataTypeCounters.forEach(function (typeCounter) {
            if (threshold.isAbove(typeCounter.nulls)) {
                typeCounter.datatype = DataTypes.NONE;
            } else if (typeCounter.numbers > typeCounter.dates && threshold.isAbove(typeCounter.numbers + typeCounter.nulls)) {
                typeCounter.datatype = DataTypes.NUMERIC;
            } else if (threshold.isAbove(typeCounter.dates + typeCounter.nulls)) {
                typeCounter.datatype = DataTypes.TIME;
            } else if (threshold.isAbove(typeCounter.strings + typeCounter.nulls)) {
                typeCounter.datatype = DataTypes.CATEGORICAL;
            } else if (threshold.isAbove(typeCounter.numbers + typeCounter.nulls)) {
                typeCounter.datatype = DataTypes.NUMERIC;
            } else {
                typeCounter.datatype = DataTypes.NONE;
            }
        });

        dataTypeCounters.forEach(function (counter) {
            var type = counter.datatype;
            if (DataTypes.isTime(type) || DataTypes.isCategorical(type)) {
                if (!xAxis) {
                    xAxis = counter;
                    counter.predictedAxis = Axis.X;
                } else {
                    counter.predictedAxis = Axis.NONE;
                }
            } else if (DataTypes.isNumeric(type)) {
                counter.predictedAxis = Axis.Y;
            } else {
                counter.predictedAxis = Axis.NONE;
            }
        });

        // second pass in case we predict wrongly the first time
        // if !axes.y.length && !axes.x then error
        // if !axes.y.length then look at axes.none and try to add some of them to axes.y

        var newColumns = dataTypeCounters.map(function (counter, index) {
            return new Column({
                property: counter.colName,
                label: counter.colName,
                axis: counter.predictedAxis,
                typeInfo: counter
            });
        });

        var originalData = JSON.parse(JSON.stringify(data));
        var isUnsafeDateString = /(^[^\d]|^\d{1,2}$|^(\d{1,2})[\/\-\ ]+)/;
        var unsafeDateString = true;
        var timeCols = [];
        var typeInfo;
        var colName;
        var attemptedDate;
        var val;
        var dateFormat;
        var countDateFormats;
        var totalNonDateStrings;
        var mostPopularDateFormatCount;
        var mostPopularDateFormat;

        for (var i = 0, x = newColumns.length; i < x; i++) {

            typeInfo = newColumns[i].get('typeInfo');
            colName = typeInfo.colName;

            if (typeInfo.datatype === DataTypes.TIME) {

                typeInfo.dateFormats = [];
                countDateFormats = {};
                totalNonDateStrings = 0;

                for (var j = 0; j < file.numRows; j++) {
                    val = data[j][colName];

                    if (!val) continue;

                    attemptedDate = NaN;
                    unsafeDateString = true;//isUnsafeDateString.test(val);

                    // Don't attempt to make a date object from an unsafe string. Javascript's date
                    // constructor (esp in Chrome/V8) will happily parse ambiguous strings without understanding
                    // the difference between day and month when they appear first.
                    // Any will fill in the year if one isn't provied
                    if (typeof val === 'string' && !unsafeDateString) {
                        attemptedDate = new Date(val);
                    }

                    if (isNaN(+attemptedDate)) {
                        dateFormat = predictedDateFormat(val);
                        totalNonDateStrings++;
                        if (dateFormat) {
                            typeInfo.dateFormats.push(dateFormat);
                            if (dateFormat in countDateFormats) {
                                countDateFormats[dateFormat]++;
                            } else {
                                countDateFormats[dateFormat] = 1;
                            }
                        }
                    } else {
                        data[j][colName] = attemptedDate;
                    }
                }

                mostPopularDateFormat = null;
                mostPopularDateFormatCount = 0;

                var formatKeys = Object.keys(countDateFormats);
                var numKeys = formatKeys.length;

                if (numKeys === 1) {
                    typeInfo.mostPopularDateFormat = formatKeys[0];
                } else if (numKeys > 1) {

                    var containsLongMonths;
                    var containsShortMonths;

                    formatKeys.forEach(function (key) {

                        var count = countDateFormats[key];
                        if (count >= mostPopularDateFormatCount) {
                            // it's not good enough for the current format to be joint most-popular
                            mostPopularDateFormat = (count === mostPopularDateFormatCount) ? null : key;
                            mostPopularDateFormatCount = count;
                        }

                        if (key.indexOf('%B') !== -1) {
                            containsLongMonths = key;
                        } else if (key.indexOf('%b') !== -1) {
                            containsShortMonths = key;
                        }

                    });

                    if (mostPopularDateFormatCount && totalNonDateStrings) {

                        // the most popular date format found is more than 95%
                        // of the string values in columns (minus the values that can be parsed by the JS Date constructor)
                        var greaterThanThreshold = gtDateThreshold(mostPopularDateFormatCount, totalNonDateStrings);

                        // handle the case when some of the dates are in the month of May
                        // we therefore have a mix of long and short month formats ie %B and %b
                        // We can gloss over this because either date format will correct parse the date on those strings
                        if (!greaterThanThreshold && containsShortMonths && containsLongMonths) {
                            if (mostPopularDateFormat === containsLongMonths) {
                                mostPopularDateFormatCount += countDateFormats[containsShortMonths.replace('%B', '%b')] || 0;
                            } else if (mostPopularDateFormat === containsShortMonths) {
                                mostPopularDateFormatCount += countDateFormats[containsShortMonths.replace('%b', '%B')] || 0;
                            }
                            // recalculate if the count is over the threshold
                            greaterThanThreshold = gtDateThreshold(mostPopularDateFormatCount, totalNonDateStrings);
                        }

                        if (greaterThanThreshold) {
                            typeInfo.mostPopularDateFormat = mostPopularDateFormat;
                        } else {
                            typeInfo.mostPopularDateFormat = null;
                        }

                    } else {
                        typeInfo.mostPopularDateFormat = null;
                    }

                }

                if (typeInfo.mostPopularDateFormat && typeInfo.predictedAxis === Axis.X) {
                    transform.series(data, colName, transform.time(typeInfo.mostPopularDateFormat));
                } else if (threshold.isAbove(typeInfo.numbers + typeInfo.nulls)) {
                    typeInfo.datatype = DataTypes.NUMERIC;
                    newColumns[i].set('axis', typeInfo.predictedAxis = Axis.Y);
                }
            }
        }

        transform.table(data, newColumns, transform.number, DataTypes.NUMERIC);

        console.table(dataTypeCounters);

        this.set({
            numCols: file.numCols,
            data: data,
            originalData: originalData,
            colNames: file.colNames,
            numRows: file.numRows,
            pipelineOptions: file.pipelineOptions,
            warning: {
                message: file.warningMessage,
                rows: file.warningRows
            }
        });
        this.columns.reset(newColumns);

    },

    discardData: function () {
        this.set(this.defaults);
        this.columns.reset([]);
    },

    ignoreWarning: function () {
        this.set('warning', this.defaults.warning);
    }

}, {

    isValidType: function (type) {
        return /text\/(c|t)sv/.test(type) || type === 'text/tab-separated-values' || type === 'text/plain';
    }

});

module.exports = DataImport;

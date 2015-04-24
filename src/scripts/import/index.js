/*jshint -W083 */
//todo: PM: remove hint once tests are written

var d3 = require('d3');
var _ = require('underscore');
var Backbone = require('./../core/backbone.js');
var Column = require('./../charting/Column.js');
var Datatypes = require('./../charting/Datatypes.js');
var Axis = require('./../charting/Axis.js');
var transform = require('./../transform/index.js');
var sniffDatatype = require('./sniffDatatype.js');
var predictedDateFormat = require('./predictDateFormat.js');

var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
var emptyheaderRows = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce(function (a, num) {
    return a.concat(alphabet.map(function (h) {
        return h + (num === 0 ? '' : num);
    }));
}, []);

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

        var error = {message: '', details: []};
        var method;
        var data = [];

        // remove empty rows from the bottom
        attributes.dataAsString = (attributes.dataAsString || '').trimRight();

        // we can't just trimLeft as then we would loose empty column headers
        // so we must remove things that look like empty rows from the beginning
        attributes.dataAsString = attributes.dataAsString.replace(/^\s+$/gm, '').replace(/^\n/, '');

        if (!attributes.dataAsString) {
            error.message = 'No data found';
            return error;
        }

        if (!attributes.type) {
            attributes.type = DataImport.guessDataFormat(attributes.dataAsString);
            if (!attributes.type) {
                error.message = 'Unrecognised data format';
                return error;
            }
        }

        var isPipelineFormat = DataImport.isPipelineFormat(attributes.dataAsString);

        // Special case allow .txt pipline files. So just change the type to TSV.
        if (isPipelineFormat && attributes.type === 'text/plain') {
            attributes.type = 'text/tsv';
        }

        var supportedFormat = DataImport.isValidType(attributes.type);

        if (!supportedFormat) {
            error.message = 'Unsupported file type';
            return error;
        }

        if (attributes.type === 'text/tsv' || attributes.type === 'text/tab-separated-values') {
            method = 'TSV';
        } else if (attributes.type === 'text/csv') {
            method = 'CSV';
        } else {
            error.message = 'Unsupported import format';
            return error;
        }

        var colNames;
        var numCols;
        var convertFn;
        var warningRows = [];
        var warningMessage = null;
        var hasHeaderRow = true;
        var dataTypeCounters = [];
        var pipelineData;
        var pipelineOptions = null;
        var missingCols = 0;
        var extraCols = 0;


        // TODO: handle when the first row is not a header row.
        //       ... need to work out a row on useful header row on the fly, using letters A-Z


        try {
            if (isPipelineFormat) {
                pipelineData = DataImport.parsePipeline(attributes.dataAsString);
                attributes.dataAsString = pipelineData.dataString;
                pipelineOptions = pipelineData.options;
            }
        } catch (pipelineError) {
            error.message = pipelineError.message;
            return error;
        }

        var processRow = function (row, rowNum) {
            var values = row.map(Function.prototype.call, String.prototype.trim);
            var numValues = values.length;
            var result;

            if (hasHeaderRow && rowNum === 0) {
                colNames = values;
                numCols = numValues;

                // TODO: ensure none of the values are null/undefined/empty-string
                // if so throw an error

                var names = {}, n;

                for (var i = 0; i < numCols; i++) {

                    // ensure no duplicate column names
                    n = colNames[i];

                    if (!n) {
                        n = emptyheaderRows[i];
                    }

                    if (n in names) {
                        names[n]++;
                        n = n + '-' + names[n];
                    } else {
                        names[n] = 1;
                    }

                    colNames[i] = n;

                    dataTypeCounters.push({
                        colName: n,
                        strings: 0,
                        stringValues: [],
                        nulls: 0,
                        numbers: 0,
                        numberValues: [],
                        dates: 0,
                        dateValues: []
                    });
                }
                return;
            } else if (numValues <= 1 && !values[0]) {
                // empty row
                return;
            } else if (numValues > numCols) {
                warningRows.push({
                    rowNum: rowNum,
                    numValues: numValues,
                    values: values.slice(0),
                    message: 'Too many values'
                });
                extraCols += (numValues - numCols);
                values = values.slice(0, numCols);
            } else if (numValues < numCols) {
                warningRows.push({
                    rowNum: rowNum,
                    numValues: numValues,
                    values: values.slice(0),
                    message: 'Not as many values as there are columns'
                });
                missingCols += (numCols - numValues);
                values = values.concat(new Array(numCols - numValues));
            }

            values.forEach(sniffDatatype, dataTypeCounters);
            result = _.object(colNames, values);

            return result;
        };

        try {
            data = d3[method.toLowerCase()].parseRows(attributes.dataAsString, processRow);
        } catch (e) {
            error.message = 'There was a problem with the ' + method + ' data';
            return error;
        }

        var numRows = data.length;

        if (!numRows) {
            error.message = 'No data found';
            return error;
        }

        if (numCols < 2) {
            error.message = 'Your data needs 2 columns or more.';
            return error;
        }

        if (warningRows.length) {
            if (!!missingCols && missingCols / numRows % 1 === 0) {
                warningMessage = 'The data appears to be missing ' + (missingCols / numRows) + ' whole columns of data.';
            } else if (!!extraCols && extraCols / numRows % 1 === 0) {
                warningMessage = 'There  seems to be ' + (extraCols / numRows) + ' columns without headers. The data for these has been discarded.';
            } else if (!missingCols && !!extraCols && extraCols < numRows) {
                warningMessage = 'Some rows have too many values. These values have been discarded.';
            } else if (!extraCols && !!missingCols && missingCols < numRows) {
                // DO NOTHING - we assume the last (right-most) column has some null values.
            } else {
                warningMessage = 'Some rows in the data have warnings. A data repair was attempted but you should probably check the data in a spreadsheet.';
            }
        }

        var threshold = new Threshold(numRows);

        dataTypeCounters.forEach(function (typeCounter) {
            if (threshold.isAbove(typeCounter.nulls)) {
                typeCounter.datatype = Datatypes.NONE;
            } else if (typeCounter.numbers > typeCounter.dates && threshold.isAbove(typeCounter.numbers + typeCounter.nulls)) {
                typeCounter.datatype = Datatypes.NUMERIC;
            } else if (threshold.isAbove(typeCounter.dates + typeCounter.nulls)) {
                typeCounter.datatype = Datatypes.TIME;
            } else if (threshold.isAbove(typeCounter.strings + typeCounter.nulls)) {
                typeCounter.datatype = Datatypes.CATEGORICAL;
            } else if (threshold.isAbove(typeCounter.numbers + typeCounter.nulls)) {
                typeCounter.datatype = Datatypes.NUMERIC;
            } else {
                typeCounter.datatype = Datatypes.NONE;
            }
        });

        var xAxis;

        dataTypeCounters.forEach(function (counter) {
            var type = counter.datatype;
            if (Datatypes.isTime(type) || Datatypes.isCategorical(type)) {
                if (!xAxis) {
                    xAxis = counter;
                    counter.predictedAxis = Axis.X;
                } else {
                    counter.predictedAxis = Axis.NONE;
                }
            } else if (Datatypes.isNumeric(type)) {
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

            if (typeInfo.datatype === Datatypes.TIME) {

                typeInfo.dateFormats = [];
                countDateFormats = {};
                totalNonDateStrings = 0;

                for (var j = 0; j < numRows; j++) {
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
                    typeInfo.datatype = Datatypes.NUMERIC;
                    newColumns[i].set('axis', typeInfo.predictedAxis = Axis.Y);
                }
            }
        }

        transform.table(data, newColumns, transform.number, Datatypes.NUMERIC);

        console.table(dataTypeCounters);

        this.set({
            numCols: numCols,
            data: data,
            originalData: originalData,
            colNames: colNames,
            numRows: numRows,
            pipelineOptions: pipelineOptions,
            warning: {
                message: warningMessage,
                rows: warningRows
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
    },

    isPipelineFormat: function (str) {
        return str.substring(0, 2) === '&\t';
    },

    parsePipeline: function (str) {
        /*jshint -W084 */
        var lines = str.trim().split(/[\n\r]+/gm);
        var line;
        var options = {};

        while (line = lines.pop()) {
            if (!line) {
                continue;
            }
            if (line.charAt(0) === '\t') {
                throw new Error('Pipeline formatted files must have a value for every cell in the index ("&") column.');
            }
            line = line.trim();
            if (!line) {
                continue;
            }
            if (line.charAt(0) !== '&') {
                lines.push(line);
                break;
            }
            var bits = line.split(/=/).map(Function.prototype.call, String.prototype.trim);
            var value = bits[1];
            if (value || value !== 'delete if not required') {
                options[bits[0].replace(/^&/, '')] = value;
            }
        }
        str = lines.join('\n');
        return {dataString: str, options: options};
    },

    guessDataFormat: function (dataAsString) {

        if (dataAsString) {
            var lines = dataAsString.split(/\n/g);
            if (lines.length) {
                var line = (lines[0] || '').replace(/"(.*?)"/g, '');
                var tabs = (line.match(/\t/g) || []).length;
                var commas = (line.match(/\,/g) || []).length;
                if (tabs > commas) {
                    return 'text/tsv';
                } else if (commas > tabs) {
                    return 'text/csv';
                }
            }
        }

        return null;
    }

});

var tests = {
    '1.101': null,
    '1,000': null,
    '1,000,000': null,
    '1': '%Y',
    '11': '%Y',
    '111': '%Y',
    '1999': '%Y',
    '11111': null,
    '01-1999': '%m/%Y',
    '12-1999': '%m/%Y',
    '13-1999': null,
    '32-1999': null,
    'Jan 1999': '%b/%Y',
    '31/01/2014': '%d/%m/%Y',
    '31/01/14': '%d/%m/%y',
    '01/31/2014': '%x',
    '01/31/14': '%m/%d/%y',
    '01 January 2014': '%d/%B/%Y',
    '13/01/13': '%d/%m/%y',
    '01/13/13': '%m/%d/%y',
    '13/01/01': '%d/%m/%y',
    '01/13/01': '%m/%d/%y',
    '12/01/12': null,
    '01/12/12': null,
    '1/1/14': null,
    '01-01-01': null,
    '14/14': null,
    '11/14': '%m/%y',
    '01/13/2013': '%x',
    '01 Jan 2014': '%d/%b/%Y',
    '32 Jan 2014': null,
    'Jan 01 2014': '%b/%d/%Y',
    'Jan 32 2014': null,
    'January 01 2014': '%B/%d/%Y',
    '2014 January 01': '%Y/%B/%d',
};

Object.keys(tests).forEach(function (key) {
    var date = key;
    var format = tests[key];
    var result = predictedDateFormat(date);
    console.assert(result === format, 'Date:' + date + ' Format:' + format + ' Result:' + result);
});

module.exports = DataImport;

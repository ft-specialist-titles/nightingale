var d3 = require('d3');
var Backbone = require('./../core/backbone.js');
var DataTypes = require('./../charting/Datatypes.js');
var Axis = require('./Axis.js');
var transform = require('./../transform/index.js');
var ValidateFile = require('../import/validateFile.js');
var describeColumns = require('../import/describeColumns.js');
var setPopularDateFormat = require('../import/setPopularDateFormat.js');
var unitGenerator = require('o-charts').util.dates.unitGenerator;


var Threshold = function (numRows) {
    var percent = 95;
    var s = 100 / numRows;
    var almost = numRows - 1;
    this.isAbove = function (count) {
        return (count >= almost) || (count * s > percent);
    };
    return this;
};

function parseDate(dateString, format) {
    return format.parse(dateString.split(/[\:\/\-\ ]+/).join('/'));
}

function setDateIntervalAverage(file, typeInfo){
    if (!typeInfo.mostPopularDateFormat) return;
    var days = [];
    var months = [];
    var years = [];
    var format = d3.time.format(typeInfo.mostPopularDateFormat);
    typeInfo.dateValues.forEach(function(date,i){
        if (i===0) return;
        var start = parseDate(typeInfo.dateValues[i-1], format);
        var end = parseDate(date,format);
        days.push((d3.time.days(start, end)).length);
        months.push((d3.time.months(start, end)).length);
        years.push((d3.time.years(start, end)).length);
    });
    var dayAverage = d3.mean(days);
    var monthAverage = d3.mean(months);
    var yearAverage = d3.mean(years);
    var yearly = (dayAverage > 363 && dayAverage < 367 && yearAverage === 1);
    //todo: move this check first to improve speed of processing
    var quarterly = (dayAverage > 88 && dayAverage < 92 && monthAverage === 3) ||
        typeInfo.mostPopularDateFormat.indexOf('%q')>=0;
    var monthly = (dayAverage > 27 && dayAverage < 32 && monthAverage === 1);
    typeInfo.units = (yearly) ? ['yearly'] : typeInfo.units;
    typeInfo.units = (quarterly) ? ['quarterly', 'yearly'] : typeInfo.units;
    typeInfo.units = (monthly) ? ['monthly', 'yearly'] : typeInfo.units;
}

function getDateRange(typeInfo) {
    var format = d3.time.format(typeInfo.mostPopularDateFormat);
    var start = parseDate(typeInfo.dateValues[0], format);
    var lastIdx = typeInfo.dateValues.length - 1;
    var end = parseDate(typeInfo.dateValues[lastIdx], format);

    return [start, end];
}


function findRecommendedChartStyle(typeInfo) {

    // what's the maximum acceptable number of columns
    var MAX_ACCEPTABLE_NUMBER_OF_COLUMNS = 15;

    // if it isn't a discrete period, we can return early and assume
    // we want a line chart
    if (typeof typeInfo.units === 'undefined') {
        return 'Line';
    }

    var range = getDateRange(typeInfo);

    var density = 0;

    var rangeFunction;

    switch (typeInfo.units[0]) {
        case "monthly":
            density = d3.time.months(range[0], range[1]).length;
            break;
        case "quarterly":
            density = (d3.time.months(range[0], range[1]).length / 3) | 0;
            break;
        case "yearly":
            density = d3.time.years(range[0], range[1]).length;
            break;
        default:
            density = -1;
            break;
    }

    // we now check that the time span of the data provided doesn't
    // excede a set number of 'periods'
    var isTooDense = density > MAX_ACCEPTABLE_NUMBER_OF_COLUMNS;

    if (isTooDense) {
        return 'Line';
    }

    return 'Column';

}

var DataImport = Backbone.Model.extend({

    defaults: {
        type: '',
        hasHeaderRow: true,
        dataAsString: '',
        numRows: 0,
        numCols: 0,
        recommendedChartStyle: 'Column',
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

    recomputeRecommendedChartStyle: function() {
        var typeInfo,
            recommendedChartStyle = 'Column';

        for (var i = 0, l = this.columns.length; i < l; i++) {
            typeInfo = this.columns.at(i).get('typeInfo');
            if (typeInfo.dataType === DataTypes.TIME) {
                if (typeInfo.mostPopularDateFormat && typeInfo.predictedAxis === Axis.X) {
                    recommendedChartStyle = findRecommendedChartStyle(typeInfo);
                }
            }
        }

        this.set('recommendedChartStyle', recommendedChartStyle);
    },

    validate: function (attributes, options) {

        var file = new ValidateFile(attributes);
        if (file.error.message) return file.error;
        var newColumns = describeColumns(file);
        var threshold = new Threshold(file.numRows);
        var originalData = JSON.parse(JSON.stringify(file.data));
        var typeInfo;
        var recommendedChartStyle;

        for (var i = 0, x = newColumns.length; i < x; i++) {

            typeInfo = newColumns[i].get('typeInfo');
            if (typeInfo.dataType === DataTypes.TIME) {

                setPopularDateFormat(file, typeInfo);
                setDateIntervalAverage(file, typeInfo);

                if (typeInfo.mostPopularDateFormat && typeInfo.predictedAxis === Axis.X) {
                    transform.series(file.data, typeInfo.colName, transform.time(typeInfo.mostPopularDateFormat));

                    // here we find a suggestion for what the most likely chart
                    // the user will want to see is. Currently, our rules are only time-based
                    // therefore we do the check in hire (where we're sure it's a TIME column)
                    recommendedChartStyle = findRecommendedChartStyle(typeInfo);

                } else if (threshold.isAbove(typeInfo.numbers + typeInfo.nulls)) {
                    typeInfo.dataType = DataTypes.NUMERIC;
                    newColumns[i].set('axis', typeInfo.predictedAxis = Axis.Y);
                }


            }
        }

        transform.table(file.data, newColumns, transform.number, DataTypes.NUMERIC);

        this.set({
            numCols: file.numCols,
            data: file.data,
            originalData: originalData,
            colNames: file.colNames,
            numRows: file.numRows,
            pipelineOptions: file.pipelineOptions,
            recommendedChartStyle: recommendedChartStyle || "Column",
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

    isValidType: function (file) {
        var type;
        //windows file.type = program associated with type i.e. could be Excel for .csv files
        switch (file.name.split('.').slice(-1)[0]){
            case 'csv':
                type = 'text/csv';
                break;
            case 'tsv':
                type = 'text/tsv';
                break;
            case 'txt':
                type = 'text/txt';
                break;
            default:
                type = file.type;
        }
        return /text\/(c|t)sv/.test(type) || type === 'text/tab-separated-values' || type === 'text/plain' || type === 'text/txt';
    }

});

module.exports = DataImport;

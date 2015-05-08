var d3 = require('d3');
var Backbone = require('./../core/backbone.js');
var DataTypes = require('./../charting/Datatypes.js');
var Axis = require('./Axis.js');
var transform = require('./../transform/index.js');
var ValidateFile = require('../import/validateFile.js');
var describeColumns = require('../import/describeColumns.js');
var setPopularDateFormat = require('../import/setPopularDateFormat.js');

var Threshold = function (numRows) {
    var percent = 95;
    var s = 100 / numRows;
    var almost = numRows - 1;
    this.isAbove = function (count) {
        return (count >= almost) || (count * s > percent);
    };
    return this;
};


function setDateIntervalAverage(file, typeInfo){
    var days = [];
    var months = [];
    var years = [];
    var format = d3.time.format(typeInfo.mostPopularDateFormat);
    typeInfo.dateValues.forEach(function(date,i){
        if (i===0) return;
        var start = format.parse(typeInfo.dateValues[i-1]);
        var end = format.parse(date);
        days.push((d3.time.days(start, end)).length);
        months.push((d3.time.months(start, end)).length);
        years.push((d3.time.years(start, end)).length);
    });
    var dayAverage = d3.mean(days);
    var monthAverage = d3.mean(months);
    var yearAverage = d3.mean(years);
    var yearly = (dayAverage > 363 && dayAverage < 367 && yearAverage === 1);
    var quarterly = (dayAverage > 88 && dayAverage < 92 && monthAverage === 3);
    var monthly = (dayAverage > 27 && dayAverage < 32 && monthAverage === 1);
    //typeInfo.groupDates = yearly ? ['yearly'] : false;
    typeInfo.groupDates = quarterly ? ['quarterly','yearly'] : typeInfo.groupDates;
    //typeInfo.groupDates = monthly ? ['monthly','yearly'] : typeInfo.groupDates;
}

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

        var file = new ValidateFile(attributes);
        if (file.error.message) return file.error;
        var newColumns = describeColumns(file);
        var threshold = new Threshold(file.numRows);
        var originalData = JSON.parse(JSON.stringify(file.data));
        var typeInfo;

        for (var i = 0, x = newColumns.length; i < x; i++) {

            typeInfo = newColumns[i].get('typeInfo');

            if (typeInfo.datatype === DataTypes.TIME) {

                setPopularDateFormat(file, typeInfo);
                setDateIntervalAverage(file, typeInfo);

                if (typeInfo.mostPopularDateFormat && typeInfo.predictedAxis === Axis.X) {
                    transform.series(file.data, typeInfo.colName, transform.time(typeInfo.mostPopularDateFormat));
                } else if (threshold.isAbove(typeInfo.numbers + typeInfo.nulls)) {
                    typeInfo.datatype = DataTypes.NUMERIC;
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


var _ = require('underscore');
var d3 = require('d3');

var sniffDataType = require('./sniffDataType.js');
var pipeline = require('./pipeline.js');

var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
var emptyHeaderRows = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce(function (a, num) {
    return a.concat(alphabet.map(function (h) {
        return h + (num === 0 ? '' : num);
    }));
}, []);

function ValidateFile (attributes) {

    this.error = {message: '', details: []};
    this.missingCols = 0;
    this.extraCols = 0;
    this.numCols = 0;
    this.colNames = [];
    this.dataTypeCounters = [];
    this.warningRows = [];
    this.data = [];
    this.pipelineOptions = null;
    this.warningMessage = null;

    var method;
    var pipelineData;

    attributes.dataAsString = this.removeEmptyRows(attributes.dataAsString);
    attributes.type = this.guessDataFormat(attributes);
    method = attributes.type.split('/')[1];

    if (this.logError(!attributes.dataAsString, 'No data found')) return this;
    if (this.logError(!attributes.type, 'Unrecognised data format')) return this;
    if (this.logError(!this.isValidType(attributes.type), 'Unsupported file type')) return this;
    if (this.logError(!method, 'Unsupported import format')) return this;

    if (pipeline.isValid(attributes.dataAsString)) {
        try {
            pipelineData = pipeline.parse(attributes.dataAsString);
            attributes.dataAsString = pipelineData.dataString;
            this.pipelineOptions = pipelineData.options;
        } catch (pipelineError) {
            this.error.message = pipelineError.message;
            return this;
        }
    }

    try {
        this.data = d3[method].parseRows(attributes.dataAsString, this.processRow.bind(this));
        this.numRows = this.data.length;
    } catch (e) {
        this.error.message = 'There was a problem with the ' + method + ' data';
        return this;
    }

    if (this.logError(!this.numRows, 'No data found')) return this.error;
    if (this.logError(this.numCols < 2, 'Your data needs 2 columns or more.')) return this.error;

    this.warningMessage = this.gatherWarnings(this.warningRows, this.numRows);
}

ValidateFile.prototype.removeEmptyRows = function(data){
    data = (data || '').trimRight();
    return data.replace(/^\s+$/gm, '').replace(/^\n/, '');
};

ValidateFile.prototype.guessDataFormat = function(attributes) {
    var dataAsString = attributes.dataAsString;
    if (!dataAsString) { return; }

    var lines = dataAsString.split(/\n/g);
    if (attributes.type === 'text/tab-separated-values'){
        attributes.type = 'text/tsv';
    } else if (lines.length) {
        var line = (lines[0] || '').replace(/"(.*?)"/g, '');
        var tabs = (line.match(/\t/g) || []).length;
        var commas = (line.match(/\,/g) || []).length;
        if (tabs > commas) {
            attributes.type = 'text/tsv';
        } else if (commas > tabs) {
            attributes.type = 'text/csv';
        }
    }
    if (pipeline.isValid(dataAsString) && attributes.type === 'text/plain'){
        attributes.type = 'text/csv';
    }
    return attributes.type;
};

ValidateFile.prototype.processRow = function(row, rowNum) {
    var values = row.map(Function.prototype.call, String.prototype.trim);
    var numValues = values.length;
    var result;
    var names = {}, n;

    if (rowNum === 0) {
        this.colNames = values;
        this.numCols = numValues;

        for (var i = 0; i < this.numCols; i++) {

            // ensure no duplicate column names
            n = this.colNames[i];

            if (!n) {
                n = emptyHeaderRows[i];
            }

            if (n in names) {
                names[n]++;
                n = n + '-' + names[n];
            } else {
                names[n] = 1;
            }

            this.colNames[i] = n;

            this.dataTypeCounters.push({
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
    } else if (numValues > this.numCols) {
        this.warningRows.push({
            rowNum: rowNum,
            numValues: numValues,
            values: values.slice(0),
            message: 'Too many values'
        });
        this.extraCols += (numValues - this.numCols);
        values = values.slice(0, this.numCols);
    } else if (numValues < this.numCols) {
        this.warningRows.push({
            rowNum: rowNum,
            numValues: numValues,
            values: values.slice(0),
            message: 'Not as many values as there are columns'
        });
        this.missingCols += (this.numCols - numValues);
        values = values.concat(new Array(this.numCols - numValues));
    }

    values.forEach(sniffDataType, this.dataTypeCounters);
    result = _.object(this.colNames, values);

    return result;
};

ValidateFile.prototype.gatherWarnings = function(warningRows, numRows){
    if (!warningRows.length) { return; }
    var extraCols = this.extraCols;
    if (!!this.missingCols && this.missingCols / numRows % 1 === 0) {
        return 'The data appears to be missing ' + (this.missingCols / numRows) + ' whole columns of data.';
    } else if (!!extraCols && extraCols / numRows % 1 === 0) {
        return 'There  seems to be ' + (extraCols / numRows) + ' columns without headers. The data for these has been discarded.';
    } else if (!this.missingCols && !!extraCols && extraCols < numRows) {
        return 'Some rows have too many values. These values have been discarded.';
    } else if (!extraCols && !!this.missingCols && this.missingCols < numRows) {
        // DO NOTHING - we assume the last (right-most) column has some null values.
    } else {
        return 'Some rows in the data have warnings. A data repair was attempted but you should probably check the data in a spreadsheet.';
    }
};

ValidateFile.prototype.isValidType = function(type) {
    return /text\/(c|t)sv/.test(type) || type === 'text/tab-separated-values' || type === 'text/plain';
};

ValidateFile.prototype.logError = function(bool, message){
    if (bool) return (this.error.message = message);
};

module.exports = ValidateFile;

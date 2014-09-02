var Backbone = require('./core/backbone.js');
var Column = require('./Column.js');
var d3 = require('d3');
var _ = require('underscore');
var Datatypes = require('./Datatypes.js');

var partDateExp = /^(\d{2}am|\d{2}pm|mon|tues|wed|thurs|fri|sat|sun|jan|feb|march|apr|jun|jul|aug|sept|oct|nov|dec)/i;

var isPartDate = function(value) {
  return /^\d{2,4}$/.test(value) || partDateExp.test(value);
};

var isDateString = function(value) {
  var result = true;
  var s = value.split(/[\:\/\-\ ]/);
  var i = s.length;
  while (result && i--) {
    result = isPartDate(s[i]);
  }
  return result;
};

var toNumber = function(value) {

  //FIXME: this function is not very good a predicting a numeric values
  //       mainly cos regexs are not great... they were good enough for prototyping however.
  var m = value.match(/[\d\,\.]+/) 

  if (!m || m.length !== 1) {
    return NaN;
  }

  return Number(m[0].replace(/\,(?=\d)/g, ''));
};


var sniffDatatype = function(value, colNum) {
  // this is set as the context when the forEach invokes .
  var o = this[colNum];
  var isNumber = false;
  var isDate = false;

  if (value === '' || value === undefined || value === null) {
    o.nulls++;
    return;
  }

  var parsedNum = toNumber(value);

  if (!isNaN(parsedNum)) {
    isNumber = true;
    o.numbers++;
  }

  if (isDateString(value)) {
    isDate = true;
    o.dates++;
  }

  var hasNonNumberChars = value.search(/[^\d\,\.]/) !== -1;

  if ((!isDate && !isNumber) || (isNumber && hasNonNumberChars)) {
    o.strings++;
  }
};

var Threshold = function(numRows) {
  var percent = 95;
  var s = 100 / numRows;
  var almost = numRows - 1;
  this.isAbove = function(count) {
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
    data: []
  },

  columns: null,


  initialize: function() {
    this.columns = new Backbone.Collection();
    this.listenTo(this, 'invalid', this.discardData);
  },

  validate: function(attributes, options) {

    var error = { message: '', details: []};
    var method;
    var data = [];

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

    if (attributes.type === 'text/tsv') {
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


    if (isPipelineFormat) {
      pipelineData = DataImport.parsePipeline(attributes.dataAsString);
      attributes.dataAsString = pipelineData.dataString;
      pipelineOptions = pipelineData.options;
    }

    var processRow = function(row, rowNum) {
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
          if (n in names) {
            names[n]++;
            n = n + '-' + names[n];
            colNames[i] = n;
          } else {
            names[n] = 1;
          }

          dataTypeCounters.push({
            colName: n,
            strings: 0,
            nulls: 0,
            numbers: 0,
            dates: 0
          });
        }
        return;
      } else if (numValues <= 1 && !values[0]) {
        // empty row
        return;
      } else if (numValues > numCols) {
        warningRows.push({rowNum: rowNum, numValues: numValues, values: values.slice(0), message: 'Too many values'});
        extraCols += (numValues - numCols);
        values = values.slice(0, numCols);
      } else if (numValues < numCols) {
        warningRows.push({rowNum: rowNum, numValues: numValues, values: values.slice(0), message: 'Not as many values as there are columns'});
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
      if (!!missingCols && missingCols/numRows % 1 === 0) {
        warningMessage = 'The data appears to be missing ' + (missingCols/numRows) + ' whole columns of data.';
      } else if(!!extraCols && extraCols/numRows % 1 === 0) {
        warningMessage = 'There  seems to be ' + (extraCols/numRows) + ' columns without headers. The data for these has been discarded.';
      } else if(!missingCols && !!extraCols && extraCols < numRows) {
        warningMessage = 'Some rows have too many values. These values have been discarded.';
      } else if(!extraCols && !!missingCols && missingCols < numRows) {
        // DO NOTHING - we assume the last (right-most) column has some null values.
      } else {
        warningMessage = 'Some rows in the data have warnings. A data repair was attempted but you should probably check the data in a spreadsheet.';
      }
    }

    var threshold = new Threshold(numRows);

    dataTypeCounters.forEach(function (typeCounter) {
      if (threshold.isAbove(typeCounter.nulls)) {
        typeCounter.datatype = Datatypes.NONE;
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

    console.log('sniffing the datatypes');
    console.table(dataTypeCounters);

    var newColumns = [];
    var predictedDimensions = [];

    if (numCols === 2) {
      predictedDimensions = ['A', 'B'];
    } else {
      var hasCategorical = false;
      var hasTime = false;
      var numericDimension;
      var availableDimensions = ['A', 'B'/*, 'C' --- dimension C not available yet */];
      var predictedDatatypes = _.pluck(dataTypeCounters, 'datatype');
      predictedDatatypes.forEach(function (datatype) {
        if (!hasCategorical && datatype === Datatypes.CATEGORICAL) {
          // TODO:
          // perhaps we should go one step further and assume that
          // the categorical values should be unique before they can
          // be eligible for being a category axis?
          hasCategorical = true;
          predictedDimensions.push(availableDimensions.shift());
        } else if (!hasTime && datatype === Datatypes.TIME) {
          hasTime = true;
          predictedDimensions.push(availableDimensions.shift());
        } else if (datatype == Datatypes.NUMERIC) {
          // TODO:
          // At the moment we just assume all numeric
          // columns are on the same axis. need a clever way
          // of telling difference between numeric colmns that
          // are not grouped together.
          if (!numericDimension) {
            numericDimension = availableDimensions.shift();
          }
          predictedDimensions.push(numericDimension);
        } else {
          predictedDimensions.push(null);
        }
      });
    }

    newColumns = colNames.map(function (key, index) {
      var predictedDimension = predictedDimensions.shift() || null;
      return new Column({property: key, dimension: predictedDimension, typeInfo: dataTypeCounters[index]});
    });

    this.set({
      numCols: numCols,
      data: data,
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

  discardData: function() {
    this.set(this.defaults);
    this.columns.reset([]);
  },

  ignoreWarning: function() {
    this.set('warning', this.defaults.warning);
  }

},{

  isValidType: function(type) {
    return /text\/(c|t)sv/.test(type) || type === 'text/plain';
  },

  isPipelineFormat: function(str) {
    return str.substring(0, 2) === '&\t';
  },

  parsePipeline: function(str) {

    var lines = str.trim().split(/[\n\r]+/gm);
    var line;
    var options = {};

    while(line = lines.pop()) {
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

  guessDataFormat: function(dataAsString) {

    if (dataAsString) {
      var lines = dataAsString.split(/\n/g);
      if (lines.length) {
        var line = (lines[0]||'').replace(/"(.*?)"/g, '');
        var tabs = (line.match(/\t/g)  || []).length;
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

module.exports = DataImport;

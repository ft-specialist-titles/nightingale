var DataTypes = require('./../charting/Datatypes.js');
var Axis = require('./../models/Axis.js');
var Column = require('./../models/Column.js');

var Threshold = function (numRows) {
    var percent = 95;
    var s = 100 / numRows;
    var almost = numRows - 1;
    this.isAbove = function (count) {
        return (count >= almost) || (count * s > percent);
    };
    return this;
};

function describeColumns(file){

    var xAxis;
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

    console.table(file.dataTypeCounters);
    return newColumns;
}

module.exports = describeColumns

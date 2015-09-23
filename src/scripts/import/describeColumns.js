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
            // typeCounter.dataType = DataTypes.NONE;

            // Check whether or not there is a clear runner up
            // of dataType and assign that as the data type
            // If all null, then it's NONE
            // if, of the remaining values, there is a percentage (over 60(?)) of 
            // aanother data type assign that as the data type
            // Otherwise, disregard and keep dataType as NONE

            var remainingData = typeCounter.numbers + typeCounter.strings,
                acceptanceValue = 0.6;

            // acceptanceValue is an aribitrary value. If one of datatypes takes up over 60% of the remaining data values that
            // aren't null ("-") then it's reasonable to assume that the column just has a lot of blanks
            // but that the user intends for that column to be be displayed as data with N/A in place
            // of the empty values

            if(remainingData === 0){
                typeCounter.dataType = DataTypes.NONE;
            } else if(typeCounter.numbers > typeCounter.strings && (typeCounter.numbers / remainingData) >= acceptanceValue){
                typeCounter.dataType = DataTypes.NUMERIC;
            } else if(typeCounter.numbers < typeCounter.strings && (typeCounter.strings / remainingData) >= acceptanceValue){
                typeCounter.dataType = DataTypes.CATEGORICAL;
            } else {
                typeCounter.dataType = DataTypes.NONE;
            }

        } else if (typeCounter.numbers > typeCounter.dates && threshold.isAbove(typeCounter.numbers + typeCounter.nulls)) {
            typeCounter.dataType = DataTypes.NUMERIC;
        } else if (threshold.isAbove(typeCounter.dates + typeCounter.nulls)) {
            typeCounter.dataType = DataTypes.TIME;
        } else if (threshold.isAbove(typeCounter.strings + typeCounter.nulls)) {
            typeCounter.dataType = DataTypes.CATEGORICAL;
        } else if (threshold.isAbove(typeCounter.numbers + typeCounter.nulls)) {
            typeCounter.dataType = DataTypes.NUMERIC;
        } else {
            typeCounter.dataType = DataTypes.NONE;
        }
    });

    dataTypeCounters.forEach(function (counter) {
        var type = counter.dataType;
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

module.exports = describeColumns;

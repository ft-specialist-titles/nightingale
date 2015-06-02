var Axis = require('../models/Axis.js');
var DataTypes = require('./Datatypes.js');
var _ = require('underscore');
var Column = require('../models/Column.js');

var defaultDatatype = DataTypes.TIME;

function convertPipelineIndexHeader(property, dataType) {
    if (property === '&') {
        if (DataTypes.isCategorical(dataType)) {
            return 'Category';
        } else if (DataTypes.isTime(dataType)) {
            return 'Time';
        }
    }
    return property;
}

var IndependantAxis = Axis.extend({

    initialize: function () {
        this.on('change:property', function (model, value) {
            this.set({
                suggestedLabel: convertPipelineIndexHeader(value, this.get('dataType')),
                label: null
            });
        });
    },

    defaults: _.extend({}, Axis.prototype.defaults, {
        name: Axis.X,
        dataType: defaultDatatype
    }),

    useColumn: function (column) {

        if (!column) {
            this._column = null;
            this.set('property', null);
            return;
        }

        var typeInfo = column.get('typeInfo');
        var dataType = typeInfo && typeInfo.dataType ? typeInfo.dataType : defaultDatatype;
        var units = typeInfo && typeInfo.units;
        var dateFormat = DataTypes.isTime(dataType) && typeInfo ? typeInfo.mostPopularDateFormat : null;
        this._column = column;

        this.set({
            property: column.get('property'),
            dataType: dataType,
            dateFormat: dateFormat,
            units: units
        });
    },

    createColumn: function () {
        var attributes = _.extend({}, this._column.attributes);
        attributes.property = this.attributes.property;
        attributes.dataType = this.attributes.dataType;
        attributes.label = this.attributes.label || this.attributes.property;
        attributes.axis = Axis.X;
        return new Column(attributes);
    }
});

module.exports = IndependantAxis;

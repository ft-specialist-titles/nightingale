var RegionView = require('./../core/RegionView.js');
var ViewAxisLabel = require('./AxisLabel.js');
var ViewDatatype = require('./Datatype.js');
var ViewHighlight = require('./Highlight.js');
var ViewDateFormat = require('./DateFormat.js');
var Datatypes = require('../charting/Datatypes.js');

var ViewIndependantAxisControls = RegionView.extend({

    className: 'view-independant-axis-controls',

    template: require('./../templates/independant-axis-control.hbs'),

    initialize: function (options) {
        RegionView.prototype.initialize.apply(this, arguments);
        this.dataImport = options.dataImport;
        this.listenTo(this.dataImport.columns, 'change:axis', function (column, axis) {
            if (axis === 'X') {
                this.render();
            }
        });
        this.listenTo(this.dataImport.columns, 'reset', this.render);
        this.listenTo(this.model, 'change:dataType', function(model, dataType) {
            switch (dataType) {
                case 'categorical':
                    options.dataImport.set('recommendedChartStyle', 'Column');
                    break;
                case 'numeric':
                    options.dataImport.set('recommendedChartStyle', 'Column');
                    break;
                default:
                    this.dataImport.recomputeRecommendedChartStyle();
                    break;
            }
        });
    },

    cleanup: function() {
        this.stopListening();
    },

    regions: {
        '[data-region="label"]': function () {
            return new ViewAxisLabel({
                model: this.model
            });
        },
        '[data-region="dataType"]': function () {
            return new ViewDatatype({
                model: this.model,
                show: {
                    numeric: false
                }
            });
        },
        '[data-region="highlight"]': function () {
            return new ViewHighlight({model: this.model});
        },
        '[data-region="dateFormat"]': function () {
            return new ViewDateFormat({model: this.model});
        }
    },

    bindings: {
        '[name="columns"]': {
            observe: 'property',
            selectOptions: {
                collection: 'this.dataImport.columns',
                labelPath: 'property',
                valuePath: 'property',
                defaultOption: {
                    label: '-- Pick a column for the X axis --',
                    value: null
                }
            },
            updateModel: function (value) {
                var column = this.dataImport.columns.findWhere({property: value});
                this.model.useColumn(column);
                return false;
            }
        },
        '[data-region="dateFormat"]': {
            observe: 'dataType',
            visible: Datatypes.isTime
        }
    },

    render: function () {
        RegionView.prototype.render.apply(this, arguments);
        this.stickit();
    }

});

module.exports = ViewIndependantAxisControls;

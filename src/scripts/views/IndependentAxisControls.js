var RegionView = require('./../core/RegionView.js');
var ViewAxisLabel = require('./AxisLabel.js');
var ViewDatatype = require('./Datatype.js');
var ViewHighlight = require('./Highlight.js');
var ViewDateFormat = require('./DateFormat.js');
var Datatypes = require('../charting/Datatypes.js');
var Backbone = require('../core/backbone.js');
var Errors = require('../errors/index.js');


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
        this.listenTo(Backbone, 'importVisible', this.hideErrorPopover.bind(this));
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

    isVisible: function() {
        var self = this;
        var isVisible = self.$el.is(':visible');
        var overlay = document.querySelector('.view-importdata');
        var isCovered = overlay.style.display !== 'none';
        return isVisible && !isCovered;
    },

    showErrorPopover: function() {
        var self = this;
        var select = self.$el.find('select[name="columns"]');
        if (self.tm) {
            clearTimeout(self.tm);
        }
        self.tm = setTimeout(function() {
            if (!self.model.get('hasColumn') && self.isVisible()) {
                select.popover('show');
            } else {
                select.popover('hide');
            }
            self.tm = null;
        }, 500);
    },

    hideErrorPopover: function() {
        var select = this.$el.find('select[name="columns"]');
        select.popover('hide');
    },

    bindings: {
        '[data-region="columns"]': {
            observe: 'hasColumn',
            update: function ($el, val, model, options) {
                if (val) {
                    $el.removeClass('has-error');
                } else {
                    $el.addClass('has-error');
                }
                this.showErrorPopover();
            }
        },
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
            visible: Datatypes.isTime,
            visibleFn: function($el, isVisible, options) {
                if (isVisible) {
                    $el.show();
                } else {
                    $el.hide();
                }
                Backbone.trigger('dateFormat_visible');
            }
        }
    },

    render: function () {
        RegionView.prototype.render.apply(this, arguments);
        this.$el.find('select[name="columns"]').popover({
            html: true,
            trigger: 'manual',
            template: Errors.error_template,
            content: Errors.NO_COLUMN_PICKED
        });
        this.stickit();
    }

});

module.exports = ViewIndependantAxisControls;

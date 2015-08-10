var _ = require('underscore');
var util = require('util');
var RegionView = require('./../core/RegionView.js');
var ViewLineControls = require('./LineControls.js');
var ViewColumnControls = require('./ColumnControls.js');
var SaveImageControls = require('./SaveImageControls.js');
var ViewBarControls = require('./BarControls.js');
var download = require('./../export/download.js');
var tracking = require('./../utils/tracking.js');

var controls = {
    'Line' : ViewLineControls,
    'Column' : ViewColumnControls,
    'Bar' : ViewBarControls
};

var ViewSelectedVariation = RegionView.extend({

    initialize: function (options) {
        RegionView.prototype.initialize.apply(this, arguments);
        var debounced = _.bind(_.debounce(this.render, 50), this);
        this.listenTo(this.model.graphic, 'change', debounced);
        this.listenTo(this.model.graphic.chart.xAxis, 'change', debounced);
        this.listenTo(this.model.graphic.chart.yAxis, 'change', debounced);
        this.listenTo(this.model.graphic.chart.yAxis.columns, 'change add', debounced);
        this.listenTo(this.model.graphicType.controls, 'change', debounced);
        this.listenTo(this.model.graphic.chart.dataset, 'change:rows', debounced);
        this.listenTo(this.model.errors, 'reset', this.renderErrors);
    },

    cleanup: function() {
        this.stopListening();
    },

    className: 'view-selected-variation',

    template: require('./../templates/selected-variation.hbs'),

    events: {
        'click [name="save"]': 'save',
        'click [name="hide"]': 'hide'
    },

    regions: {
        '[data-region="graphic-type-controls"]': function () {

            var viewControls = controls[this.model.graphicType.attributes.typeName];
            return new viewControls({model: this.model.graphicType});

        },
        '[data-region="save-image-controls"]': function () {
            return new SaveImageControls({model: this.model.variation});
        }
    },

    save: function (event) {

        event.preventDefault();
        event.stopPropagation();

        var svg = this.model.get('svg');
        var el = event.target;
        var format = event.altKey ? 'svg' : document.querySelector('input[name=save-format]:checked').value;
        var resolution = document.querySelector('input[name=save-resolution]:checked').value;

        el.setAttribute('disabled', 'disabled');

        function removeDisabledState() {
            el.removeAttribute('disabled');
        }

        var d = this.model.toJSON();

        // TODO: check it's possible to make the image.
        //         - dont allow the user to download a chart with validation errors
        //         - dont allow a user to download an empty image
        var width = (resolution === 'master') ? 2048 : d.svg.width;
        var height = (resolution === 'master') ? 1152 : d.svg.height;
        var filename = util.format('%s-%s-%s-%sx%s',
            (d.graphic.title ? d.graphic.title.replace(/\s/g, '_') : 'Untitled'),
            d.graphicType.typeName.toLowerCase() + '_chart',
            d.variation.variationName,
            width,
            height
        ).replace(/\s/g, '');

        // TODO: allow transparent and specified colour backgrounds
        // set this to null for transparent backgrounds
        var bgColor = '#fff1e0';

        download(filename, svg, format, bgColor, resolution, function () {
            // TODO: alert the user when there's an error creating the image

            // prevent doubleclick
            setTimeout(removeDisabledState, 200);
        });
        tracking.trackEvent(d.graphicType.typeName + ' ' + d.graphic.theme + ' Chart', width + 'x' + height, 'saveImage-' + format);
    },

    hide: function() {
        document.querySelector('#charts').classList.add('full');
    },

    render: function () {

        if (!this.model.get('svg')) {
            this.el.innerHTML = '';
            return this;
        }

        var data = this.model.toJSON();
        this.el.innerHTML = this.template(data);
        this.renderRegions();
        return this;

    }

});

module.exports = ViewSelectedVariation;

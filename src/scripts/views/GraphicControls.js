var RegionView = require('./../core/RegionView.js');
var Backbone = require('./../core/backbone.js');
var ViewIndependantAxisControls = require('./IndependentAxisControls.js');
var ViewDependantAxisControls = require('./DependantAxisControls.js');
var tracking = require('./../utils/tracking.js');

var ViewGraphicControls = RegionView.extend({

    initialize: function (options) {
        RegionView.prototype.initialize.apply(this, arguments);
        this.dataImport = options.dataImport;
        this.listenTo(Backbone, 'selectChartElement', this.selectInput);
    },

    template: require('./../templates/graphic-controls.hbs'),

    className: 'view-graphic-controls',

    bindings: {
        '[name="theme"]': 'theme',
        '[name="title"]': 'title',
        '[name="subtitle"]': 'subtitle',
        '[name="footnote"]': 'footnote',
        '[name="source"]': 'source'
    },

    events: {
        'change [name="theme"]': 'updateTheme',
        'click [name="suggest-subtitle"]': 'subtitleSuggestion',
        'click [name="discard"]': 'discard',
        'click .popular-source': 'usePopularSource'
    },

    regions: {
        '[data-region="xAxis"]': function () {
            return new ViewIndependantAxisControls({
                model: this.model.chart.xAxis,
                dataImport: this.dataImport
            });
        },
        '[data-region="yAxis"]': function () {
            return new ViewDependantAxisControls({
                model: this.model.chart.yAxis,
                dataImport: this.dataImport
            });
        },
        '[data-region="zAxis"]': function () {
            return new ViewDependantAxisControls({
                model: this.model.chart.zAxis,
                dataImport: this.dataImport
            });
        }
    },

    updateTheme: function(event){
        var theme = event.target.value;
        this.model.set('theme', theme);
        document.documentElement.classList.remove('theme--ft-web','theme--ft-video','theme--ft-print', 'theme--ic', 'theme--fta');
        document.documentElement.classList.add('theme--' + theme);
        document.querySelector('#charts').classList.add('full');//todo: call selectedVariation.hide()
    },

    usePopularSource: function (event) {
        event.preventDefault();

        var textToAdd = event.target.textContent;
        var oldValue = this.model.get('source');

        if (oldValue && oldValue.indexOf(textToAdd) !== -1) {
            return;
        }

        var newValue;

        if (event.metaKey) {
            newValue = textToAdd;
        } else {
            newValue = !oldValue && !oldValue.trim() ? textToAdd : (oldValue + ', ' + textToAdd);
        }

        this.model.set('source', newValue);
    },

    selectInput: function (name) {
        var e = this.$('[name="' + name + '"]')[0];
        if (!e) return;
        e.focus();
    },

    subtitleSuggestion: function () {
        this.model.subtitleSuggestion(true);
    },

    discard: function () {
        this.dataImport.discardData();
        // on discarding data the app will show data import view
        tracking.trackPage('DataImport');
    },

    render: function () {
        RegionView.prototype.render.apply(this, arguments);
        this.stickit();
        return this;
    }
});

module.exports = ViewGraphicControls;

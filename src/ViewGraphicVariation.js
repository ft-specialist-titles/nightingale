var Backbone = require('./core/backbone.js');
var $ = require('jquery');
var linechart = require('o-charts').chart.line;
var d3 = require('d3');
var _ = require('underscore');

var ViewGraphicVariation = Backbone.View.extend({

  initialize: function(options) {
    this.chart = linechart();
    var debounced = _.bind(_.debounce(this.render, 50), this);
    this.listenTo(this.model.graphic, 'change', debounced);
    this.listenTo(this.model.graphic.chart.xAxis, 'change', debounced);
    this.listenTo(this.model.graphic.chart.yAxis, 'change', debounced);
    this.listenTo(this.model.graphic.chart.yAxis.columns, 'change add', debounced);
  },

  className: 'view-graphic-variation',

  template: require('./templates/graphic.hbs'),

  events: {
    'click .graphic>svg': 'select'
  },

  select: function(event) {
    Backbone.trigger('selectVariation', this.model, event.currentTarget);
  },

  empty: function() {
    this.el.innerHTML = '';
    this.el.style.display = 'none';
  },

  render: function(){
    var rows = this.model.graphic.chart.dataset.get('rows').map(function(d){return Object.create(d)});
    var x = {};
    x.label = x.key = this.model.graphic.chart.xAxis.get('property');
    var y = this.model.graphic.chart.yAxis.columns.map(function (d) {
      var property = d.get('property');
      var label = d.get('label') || property;
      return {key: property, label: label};
    });
    var dateFormat = this.model.graphic.chart.xAxis.get('dateFormat');

    if (!x.key || !y.length || !rows.length) {
      this.empty();
      return;
    }

    this.el.innerHTML = this.template();

    var d = this.model.toJSON();
    var svg = this.el.querySelector('.graphic');
    var selectionBorderWidth = 3 * 2; // 3px on the left, 3px on the right
    var w = d.variation.width;

    this.el.style.width = (w + selectionBorderWidth) + 'px';
    this.el.style.display = 'block';
    svg.style.width = w + 'px';
    svg.style.borderColor = 'transparent';

    d3.select(svg).data([{

      // accumulate: "false",

      // if falseorigin is a function then we could do it based on the data ... function could be passed the scale etc.
      falseorigin: true,

      title: d.graphic.title,
      subtitle: d.graphic.subtitle,
      numberAxisOrient: 'right',
      source:  d.graphic.source,
      footnote:  d.graphic.footnote,
      dateParser: dateFormat,
      // chartWidth: w,
      chartHeight: w * (3/4),
      width: w,
      height: d.variation.height,
      error: function(errr) {
        console.log('Error', errr);
        svg.style.borderColor = '#f00';
      },
      x: {
        series: x
      },
      y: {
        series: y,
        flip: false,
        noLabels: false,
        zeroOrigin: false // could be boolean or function
      },
      data: rows
    }]).call(this.chart);
    return this;
  }

});

module.exports = ViewGraphicVariation;

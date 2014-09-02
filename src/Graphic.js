var Backbone = require('./core/backbone.js');
var _ = require('underscore');
var Chart = require('./Chart.js');

var Graphic = Backbone.Model.extend({

  initialize: function() {
    this.chart = new Chart();
  },

  defaults: {
    title: 'Untitled chart',
    subtitle: '',
    source: '',
    footnote: ''
  }
});

module.exports = Graphic;

var Backbone = require('./core/backbone.js');
var Dimension = require('./Dimension.js');
var Dataset = require('./Dataset.js');

var Chart = Backbone.Model.extend({

  initialize: function() {
    this.xAxis = new Dimension({name: 'X'});
    this.yAxis = new Dimension({name: 'Y'});
    this.zAxis = new Dimension({name: 'Z'});
    this.dataset = new Dataset();
  },

});

module.exports = Chart;

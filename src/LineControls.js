var Backbone = require('./core/backbone.js');
var _ = require('underscore');
var Chart = require('./Chart.js');
var TickStyle = require('./TickStyle.js');

var LineControls = Backbone.Model.extend({

  defaults: {
    thinLines: false,
    flipYAxis: false,
    startFromZero: false,
    nice: false,
    tickStyleX: TickStyle.AUTO,
    tickStyleY: TickStyle.AUTO
  },

  overrideConfig: function(config) {
    config.chartHeight = config.width * (3/4),
    config.numberAxisOrient = this.attributes.flipYAxis ? 'left' : 'right';
    config.y.zeroOrigin = config.falseorigin = !this.attributes.startFromZero;
    config.y.flip = this.attributes.flipYAxis;
    config.niceValue = this.attributes.nice;
    return config;
  }

});




module.exports = LineControls;

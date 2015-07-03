var Backbone = require('./../core/backbone.js');
var _ = require('underscore');
var TickStyle = require('../charting/TickStyle.js');

var LineControls = Backbone.Model.extend({

    defaults: {
        thinLines: false,
        dependentAxisOrient: false,
        dependentAxisReversed: false,
        startFromZero: false,
        nice: false,
        tickStyleX: TickStyle.AUTO,
        tickStyleY: TickStyle.AUTO
    },

    overrideConfig: function (config) {
        config.dependentAxisOrient = this.attributes.dependentAxisOrient ? 'left' : 'right';
        config.y.zeroOrigin = config.falseOrigin = !this.attributes.startFromZero;
        config.y.reverse = this.attributes.dependentAxisReversed;
        config.niceValue = this.attributes.nice;
        config.lineThickness = this.attributes.thinLines ? 'small' : 'medium';
        return config;
    }

});


module.exports = LineControls;

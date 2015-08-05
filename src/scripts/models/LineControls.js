var Backbone = require('./../core/backbone.js');
var _ = require('underscore');

var TICK_STYLE = {
    AUTO: 'auto',// works out best set of ticks to display
    NICE: 'nice',// end of the domain round up/down to nearest unit
    SIMPLE: 'simple',// only 2 ticks (at each end of the domain). no rounding
    AMOUNT: 'amount',// an amount of ticks to be display
    ARRAY: 'array'//  uses array of values for ticks
};

var LineControls = Backbone.Model.extend({

    defaults: {
        thinLines: false,
        dependentAxisOrient: false,
        dependentAxisReversed: false,
        startFromZero: false,
        horizontalKey: false,
        hoverKey: false,
        intraDay: false,
        nice: false,
        tickStyleX: TICK_STYLE.AUTO,
        tickStyleY: TICK_STYLE.AUTO
    },

    overrideConfig: function (config) {
        var lineThicknessDefault = config.theme === 'video' ? 3 : 'medium';
        config.dependentAxisOrient = this.attributes.dependentAxisOrient ? 'left' : 'right';
        config.y.zeroOrigin = config.falseOrigin = !this.attributes.startFromZero;
        config.keyColumns = this.attributes.horizontalKey ? 10 : 1;
        config.keyHover = this.attributes.hoverKey;
        config.intraDay = this.attributes.intraDay;
        config.y.reverse = this.attributes.dependentAxisReversed;
        config.niceValue = this.attributes.nice;
        config.lineThickness = this.attributes.thinLines ? 'small' : lineThicknessDefault;
        return config;
    }

});


module.exports = LineControls;

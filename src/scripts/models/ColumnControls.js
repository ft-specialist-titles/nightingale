var Backbone = require('./../core/backbone.js');
var _ = require('underscore');
var TickStyle = require('../charting/TickStyle.js');

var ColumnControls = Backbone.Model.extend({

    defaults: {
        nice: false,
        tickStyleX: TickStyle.AUTO,
        tickStyleY: TickStyle.AUTO
    },

    overrideConfig: function (config) {
        config.niceValue = this.attributes.nice;
        return config;
    }

});


module.exports = ColumnControls;

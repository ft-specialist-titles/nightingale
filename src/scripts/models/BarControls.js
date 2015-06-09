var Backbone = require('./../core/backbone.js');
var _ = require('underscore');

var BarControls = Backbone.Model.extend({

    defaults:{
        flipXAxis: false,
        stack: false
    },

    overrideConfig: function(config){
        config.dependentAxisOrient = this.attributes.flipXAxis ? 'bottom' : 'top';
        config.stack = this.attributes.stack;
        return config;
    }

});


module.exports = BarControls;

var Backbone = require('./../core/backbone.js');
var _ = require('underscore');

var BarControls = Backbone.Model.extend({

    defaults:{
        dependentAxisOrient: false,
        horizontalKey: false,
        hoverKey: false,
        stack: false
    },

    overrideConfig: function(config){
        config.dependentAxisOrient = this.attributes.dependentAxisOrient ? 'bottom' : 'top';
        config.keyColumns = this.attributes.horizontalKey ? 10 : 1;
        config.keyHover = this.attributes.hoverKey;
        //config.independentAxisOrient = this.attributes.independentAxisOrient ? 'left' : 'right';
        config.stack = this.attributes.stack;
        return config;
    }

});


module.exports = BarControls;

var Backbone = require('./../core/backbone.js');
var _ = require('underscore');

var ColumnControls = Backbone.Model.extend({

    defaults:{
        stack: false,
        horizontalKey: true,
        hoverKey: false
    },

    overrideConfig: function(config){
        config.stack = this.attributes.stack;
        config.keyColumns = this.attributes.horizontalKey ? 10 : 1;
        config.keyHover = this.attributes.hoverKey;
        return config;
    }

});


module.exports = ColumnControls;

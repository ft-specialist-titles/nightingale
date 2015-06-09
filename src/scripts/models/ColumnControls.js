var Backbone = require('./../core/backbone.js');
var _ = require('underscore');

var ColumnControls = Backbone.Model.extend({

    defaults:{
        stack: false
    },

    overrideConfig: function(config){
        config.stack = this.attributes.stack;
        return config;
    }

});


module.exports = ColumnControls;

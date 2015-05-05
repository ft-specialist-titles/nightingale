var Backbone = require('./../core/backbone.js');
var _ = require('underscore');

function setDateGroupings(grouping){
    var dateGroupings = {
        'monthly': ['monthly', 'yearly'],
        'quarterly': ['quarterly', 'yearly'],
        'yearly': ['yearly']
    };
    return dateGroupings[grouping];
}

var ColumnControls = Backbone.Model.extend({

    defaults: {
        groupDates: false
    },

    overrideConfig: function (config) {
        config.groupDates = setDateGroupings(this.attributes.groupDates);
        return config;
    }

});


module.exports = ColumnControls;

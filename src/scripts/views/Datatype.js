var Backbone = require('./../core/backbone.js');
var _ = require('underscore');

var ViewDatatype = Backbone.View.extend({

    initialize: function (options) {
        options = options || {};
        this.show = _.defaults(options.show, {
            categorical: true,
            time: true,
            numeric: true
        });
    },

    className: 'view-dataType',

    template: require('./../templates/datatype.hbs'),

    bindings: {
        '[name="dataType"]': 'dataType'
    },

    render: function () {
        this.el.innerHTML = this.template({show: this.show});
        this.stickit();
        return this;
    }

});

module.exports = ViewDatatype;

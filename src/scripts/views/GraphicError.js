var Backbone = require('./../core/backbone.js');

var ViewGraphicError = Backbone.View.extend({

    initialize: function (options) {

    },

    template: require('./../templates/graphic-type-error.hbs'),

    render: function() {
        this.el.innerHTML = this.template(this.model.toJSON());
    },

    cleanup: function() {
        this.el.innerHTML = '';
        this.el.remove();
    }

});

module.exports = ViewGraphicError;

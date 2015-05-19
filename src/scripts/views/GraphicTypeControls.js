var Backbone = require('./../core/backbone.js');

var ViewGraphicTypeControls = Backbone.View.extend({

    className: 'view-graphic-type-controls',

    template: require('./../templates/graphic-type-controls.hbs'),

    render: function () {
        this.el.innerHTML = this.template();
        return this;
    }

});

module.exports = ViewGraphicTypeControls;

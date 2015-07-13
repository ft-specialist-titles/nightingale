var Backbone = require('./../core/backbone.js');

var LineControls = Backbone.View.extend({

    className: 'view-graphic-type-controls',

    template: require('./../templates/type-controls-line.hbs'),

    bindings: {
        '[name="startFromZero"]': 'startFromZero',
        '[name="thinLines"]': 'thinLines',
        '[name="horizontalKey"]': 'horizontalKey',
        '[name="hoverKey"]': 'hoverKey',
        '[name="dependentAxisOrient"]': 'dependentAxisOrient',
        '[name="dependentAxisReversed"]': 'dependentAxisReversed',
        '[name="nice"]': 'nice'
    },

    render: function () {
        this.el.innerHTML = this.template();
        this.stickit(this.model.controls);
        return this;
    }

});

module.exports = LineControls;

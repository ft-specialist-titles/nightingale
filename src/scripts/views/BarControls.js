var Backbone = require('./../core/backbone.js');

var BarControls = Backbone.View.extend({

    className: 'view-graphic-type-controls',

    template: require('./../templates/type-controls-bar.hbs'),

    bindings: {
        '[name="stack"]': 'stack',
        '[name="hoverKey"]': 'hoverKey',
        '[name="horizontalKey"]': 'horizontalKey',
        '[name="dependentAxisOrient"]': 'dependentAxisOrient'
    },

    render: function () {
        this.el.innerHTML = this.template();
        this.stickit(this.model.controls);
        return this;
    }

});

module.exports = BarControls;

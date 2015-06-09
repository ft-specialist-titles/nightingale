var Backbone = require('./../core/backbone.js');

var BarControls = Backbone.View.extend({

    className: 'view-graphic-type-controls',

    template: require('./../templates/type-controls-bar.hbs'),

    bindings: {
        '[name="stack"]': 'stack', //make this into stack
        '[name="flipXAxis"]': 'flipXAxis'
    },

    render: function () {
        this.el.innerHTML = this.template();
        this.stickit(this.model.controls);
        return this;
    }

});

module.exports = BarControls;

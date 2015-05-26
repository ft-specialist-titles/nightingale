var Backbone = require('./../core/backbone.js');

var ColumnControls = Backbone.View.extend({

    className: 'view-graphic-type-controls',

    template: require('./../templates/type-controls-column.hbs'),

    bindings: {
        '[name="stack"]': 'stack' //make this into stack
    },

    render: function () {
        this.el.innerHTML = this.template();
        this.stickit(this.model.controls);
        return this;
    }

});

module.exports = ColumnControls;

var Backbone = require('./../core/backbone.js');
var Datatypes = require('../charting/Datatypes.js');

var ViewHighlight = Backbone.View.extend({

    className: 'view-highlight',

    template: require('./../templates/highlight.hbs'),

    bindings: {
        '[data-section-name="categorical"]': {
            observe: 'dataType',
            visible: Datatypes.isCategorical
        },
        '[data-section-name="numeric"]': {
            observe: 'dataType',
            visible: Datatypes.isNumeric
        },
        '[data-section-name="time"]': {
            observe: 'dataType',
            visible: Datatypes.isTime
        }
    },

    render: function () {
        var data = this.model ? this.model.toJSON() : {};
        this.el.innerHTML = this.template(data);
        this.stickit();
        return this;
    }

});

module.exports = ViewHighlight;

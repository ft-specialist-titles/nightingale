var Backbone = require('./../core/backbone');

var GraphicType = Backbone.Model.extend({

    initialize: function (attributes, options) {
        this.theme = options.theme;
        this.graphic = options.graphic;
        this.variations = options.variations;
        this.controls = options.controls;
    },

    defaults: {
        typeName: '',
        suitabilityRanking: 0
    }
});

module.exports = GraphicType;

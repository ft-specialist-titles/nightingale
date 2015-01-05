var Backbone = require('./core/backbone');

var GraphicType = Backbone.Model.extend({

  initialize: function(attributes, options) {
    this.graphic = options.graphic;
    this.variations = options.variations;
  },

  defaults: {
    typeName: '' 
  }
});

module.exports = GraphicType;

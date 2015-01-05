var Backbone = require('./core/backbone.js');

var GraphicVariation = Backbone.Model.extend({
  initialize: function(attributes, options) {
    this.variation = options.variation;
    this.graphic = options.graphic;
    this.graphicType = options.graphicType;
  },

  toJSON: function() {
    var d = Backbone.Model.prototype.toJSON.call(this);
    d.graphic = this.graphic.toJSON();
    d.graphicType = this.graphicType.toJSON();
    d.variation = this.variation.toJSON();
    return d;
  }
});

module.exports = GraphicVariation;

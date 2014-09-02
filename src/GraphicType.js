var Backbone = require('./core/backbone');

var GraphicType = Backbone.Model.extend({
  defaults: {
    name: '',
    factory: null,
    graphic: null
  }
});

module.exports = GraphicType;

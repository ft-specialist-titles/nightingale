var Backbone = require('./core/backbone.js');

module.exports = Backbone.Model.extend({

  defaults: {
    property: '',
    dimension: 'A',
    isOther: false
  }

});

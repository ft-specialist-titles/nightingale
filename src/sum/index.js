var Backbone = require('backbone');

var Maths = Backbone.Model.extend({
  sum: function(a, b){
    return a + b;
  }
});

module.exports = Maths;

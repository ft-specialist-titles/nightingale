var RegionView = require('./core/RegionView.js');
var Backbone = require('./core/backbone.js');

// var ViewTitle = Backbone.View.extend({

// });

var ViewGraphicControls = RegionView.extend({

  template: require('./templates/graphic-controls.hbs'),

  bindings: {
    '[name="title"]': 'title',
    '[name="subtitle"]': 'subtitle',
    '[name="footnote"]': 'footnote',
    '[name="source"]': 'source'
  },

  render: function() {
    console.log('RENDER')
    RegionView.prototype.render.apply(this, arguments);
    this.stickit();
    return this;
  }
});

module.exports = ViewGraphicControls;

var RegionView = require('./core/RegionView.js');
var CollectionView = require('./core/CollectionView.js');
var ViewColumns = require('./ViewColumns.js');

var ViewImportedData = RegionView.extend({

  initialize: function() {
    RegionView.prototype.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change:data', this.render);
  },

  className: 'view-imported-data',

  template: require('./templates/imported-data.hbs'),

  regions: {
    '[data-region="columns"]': function() {
      return new ViewColumns({collection: this.model.columns})
    }
  },

  events: {
    'click [name="discard"]': 'discard'
  },

  discard: function() {
    this.model.discardData();
  },

  dataChange: function() {
    var msg = this.$('.alert-success');
    if (this.model.get('numRows') > 0 ) {
      this.$el.fadeIn();
      msg.css('opacity', 1);
      msg.delay(1500).animate({opacity:0}, 'fast');
    } else {
      this.$el.hide();
      msg.css('opacity', 0);
    }
  },

  render: function() {
    RegionView.prototype.render.apply(this, arguments);
    this.dataChange();
    return this;
  }

});

module.exports = ViewImportedData;

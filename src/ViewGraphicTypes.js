var CollectionView = require('./core/CollectionView.js');
var RegionView = require('./core/RegionView.js');
var ViewGraphicVariation = require('./ViewGraphicVariation.js');

var ViewGraphicTypes = CollectionView.extend({

  className: 'view-graphic-type-collection',

  itemView: CollectionView.extend({

    className: 'view-graphic-variation-collection',

    template: require('./templates/graphic-type.hbs'),

    itemContainer: '[data-region="variations"]',

    createView: function(variation, index) {
      var opts = variation.toJSON();
      opts.model = this.model;
      return new this._ItemClass(opts);
    },

    itemView: ViewGraphicVariation

  }),

  createView: function(model, index) {
    return new this._ItemClass({model: model, collection: model.get('variations')});
  }

});

module.exports = ViewGraphicTypes;

var CollectionView = require('./core/CollectionView.js');
var Backbone = require('./core/backbone.js');

var ViewColumns = CollectionView.extend({

  className: 'config-dimensions',

  template: require('./templates/imported-columns.hbs'),

  itemContainer: 'tbody',

  itemView: {

    tagName: 'tr',

    className: 'view-single-column',

    template: require('./templates/column.hbs'),

    bindings: {
      '[name^="dimension-"]': 'dimension'
    }

  }

});

module.exports = ViewColumns;

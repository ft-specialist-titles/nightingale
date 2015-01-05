var CollectionView = require('./core/CollectionView.js');
var Backbone = require('./core/backbone.js');

var ViewColumns = CollectionView.extend({

  className: 'config-axes',

  template: require('./templates/imported-columns.hbs'),

  itemContainer: 'tbody',

  itemView: {

    tagName: 'tr',

    className: 'view-single-column',

    template: require('./templates/column.hbs'),

    bindings: {
      '[name^="axis-"]': 'axis'
    }

  }

});

module.exports = ViewColumns;

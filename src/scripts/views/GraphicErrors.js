var Backbone = require('./../core/backbone.js');
var CollectionView = require('./../core/CollectionView.js');
var ViewGraphicError = require('./GraphicError.js');

var ViewGraphicErrors = CollectionView.extend({

    className: 'view-graphic-type-errors',

    createView: function(model, index) {
        return new this._ItemClass({
            model: model,
        });
    },

    itemView: ViewGraphicError
});

module.exports = ViewGraphicErrors;

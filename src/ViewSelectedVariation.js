var RegionView = require('./core/RegionView.js');
var download = require('./export/download.js');
var util = require('util');
var attributeStyler = require('o-charts').util.attributeStyler;

var ViewSelectedVariation = RegionView.extend({

  initialize: function(options) {
    RegionView.prototype.initialize.apply(this, arguments);
    this.svg = options.svg;
  },

  className: 'view-selected-variation',

  template: require('./templates/selected-variation.hbs'),

  events: {
    'click [name="save"]': 'save',
  },

  save: function(event) {

    event.preventDefault();
    event.stopPropagation();

    var svg = this.svg;
    var el = event.target;
    var format = event.altKey ? 'svg' : 'png';

    el.setAttribute('disabled', 'disabled');

    function removeDisabledState() {
      el.removeAttribute('disabled');
    }
    // TODO: check it's possible to make the image.
    //         - dont allow the user to download a chart with validation errors
    //         - dont allow a user to download an empty image

    var filename = util.format('%s-%s-%s-%sx%s',
                            this.model.graphic.get('title').replace(/\s/g, '_'),
                            this.model.graphicType.get('typeName'),
                            this.model.variation.get('variationName'),
                            svg.getAttribute('width'),
                            svg.getAttribute('height')
                            ).replace(/\s/g, '');

    // TODO: allow transparent and specified colour backgrounds
    // set this to null for transparent backgrounds
    var bgColor = '#fff1e0';

    attributeStyler();

    download(filename, svg, format, bgColor, function(){
      //TODO: alert the user when there's an error creating the image

      // prevent doubleclick
      setTimeout(removeDisabledState, 200);
    });
  },

  render: function() {
    RegionView.prototype.render.apply(this, arguments);
    return this;
  },

});

module.exports = ViewSelectedVariation;

// function closeDropdown(event) {
//   $('[data-toggle="dropdown"]').parent().removeClass('open');
// }
// document.addEventListener('click', closeDropdown, true);


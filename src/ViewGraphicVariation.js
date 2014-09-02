var Backbone = require('./core/backbone.js');
var $ = require('jquery');
var download = require('./export/download.js');
var linechart = require('modest-charts/src/ft-line-chart.js');
var d3 = require('d3');

console.log('LINECHART', linechart);



var availableFormats = {
  png: 'PNG',
  jpg: 'JPEG',
  svg: 'SVG'
};

var currentlySelectedFormat = 'png';

var dropdown = (function(){

  var initd = 0;

  function closeDropdown(event) {
    $('[data-toggle="dropdown"]').parent().removeClass('open');
  }

  return {
    setup: function() {
      initd++;
      if (initd > 1) return;
      document.addEventListener('click', closeDropdown, true);
    },
    teardown: function() {
      initd--;
      if (initd) return;
      document.removeEventListener('click', closeDropdown, true);
    }
  };
}());

function createFilename(svg, model) {
  // TODO: get the chart title from the model
  // TODO: what about when the Height is set as 'auto' , we want to get the height of the graphic instead
  return 'ChartTitle' + '-' + parseInt(svg.getAttribute('width')) + 'x' + parseInt(svg.getAttribute('height')) + '-' + model.name + '-' + model.graphicType;
}

var ViewGraphicVariation = Backbone.View.extend({

  initialize: function(options) {
    this.width = options.width;
    this.height = options.height;
    this.chart = linechart();
  },

  className: 'view-graphic-variation graphic-instance chart-type-line',

  template: require('./templates/graphic.hbs'),

  events: {
    'click [data-save-format]': 'save'
  },

  save: function(event) {
    if (!event.target.dataset.saveFormat) return;

    var changeType = currentlySelectedFormat !== event.target.dataset.saveFormat;

    currentlySelectedFormat = event.target.dataset.saveFormat;

    if (event.target.nodeName === 'A') {
      event.preventDefault();
    }

    event.stopPropagation();
    var self = this;
 
    if (changeType) {
      window.requestAnimationFrame(function(){
        self.$('.selected-format')
            .attr('data-save-format', currentlySelectedFormat)
            .text('Save as ' + availableFormats[currentlySelectedFormat]);
      });
    }

    var svg = this.$('svg')[0];
    var el = event.target;


    el.setAttribute('disabled', 'disabled');

    function removeDisabledState() {
      el.removeAttribute('disabled');
    }

    // TODO: check it's possible to make the image.
    //         - dont allow the user to download a chart with validation errors
    //         - dont allow a user to download an empty image

    var filename = createFilename(svg, this.model);

    // TODO: allow transparent and specified colour backgrounds
    // set this to null for transparent backgrounds
    var bgColor = '#fff1e0';

    download(filename, svg, currentlySelectedFormat, bgColor, function(){
      //TODO: alert the user when there's an error creating the image

      // prevent doubleclick
      setTimeout(removeDisabledState, 200);
    });
  },

  delgateEvents: function() {
    Backbone.View.prototype.remove.apply(this, arguments);
    dropdown.teardown();
  },

  render: function(){
    var msg = 'I am a ' + this.model.name + ' Line chart. Dimensions: ' + this.model.width + ' x ' + this.model.height;
    this.el.innerHTML = this.template({
      message: msg,
      chartClass: 'line-chart',
      width: this.width,
      height: this.height
    });

    var dp = d3.time.format('%Y').parse

    var svg = this.el.querySelector('.graphic');

    d3.select(svg).data([{
      // accumulate: "false",
      comment: "Line chart",
      // doublescale: "0",
      footnote: "A real footnote",
      source: "Macquarie.com",
      subtitle: "%",
      title: "China share of global demand",
      indexProperty: 'date',
      dateParser: dp,
      width: this.width,
      height: this.height,
      plotWidth: 200,
      plotHeight: 200,
      headings: [
        'date',
        'value',
        'value2'
      ],
      data: [
        {date: '2000', value: '10', value2: '40'},
        {date: '2001', value: '20', value2: '30'},
        {date: '2002', value: '30', value2: '20'},
        {date: '2003', value: '40', value2: '10'}
      ]
    }]).call(this.chart);
    dropdown.setup();
    return this;
  }

});

module.exports = ViewGraphicVariation;

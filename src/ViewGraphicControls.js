var RegionView = require('./core/RegionView.js');
var Backbone = require('./core/backbone.js');
var ViewIndependantAxisControls = require('./ViewIndependantAxisControls.js');
var ViewDependantAxisControls = require('./ViewDependantAxisControls.js');

var ViewGraphicControls = RegionView.extend({

  initialize: function(options) {
    RegionView.prototype.initialize.apply(this, arguments);
    this.dataImport = options.dataImport;
    this.listenTo(Backbone, 'selectChartElement', this.selectInput)
  },

  template: require('./templates/graphic-controls.hbs'),

  className: 'view-graphic-controls',

  bindings: {
    '[name="title"]':     'title',
    '[name="subtitle"]':  'subtitle',
    '[name="footnote"]':  'footnote',
    '[name="source"]':    'source'
  },

  events: {
    'click [name="suggest-subtitle"]': 'subtitleSuggestion',
    'click [name="discard"]': 'discard'
  },

  regions: {
    '[data-region="xAxis"]': function () {
      return new ViewIndependantAxisControls({
        model: this.model.chart.xAxis,
        dataImport: this.dataImport
      });
    },
    '[data-region="yAxis"]': function () {
      return new ViewDependantAxisControls({
        model: this.model.chart.yAxis,
        dataImport: this.dataImport
      });
    },
    '[data-region="zAxis"]': function () {
      return new ViewDependantAxisControls({
        model: this.model.chart.zAxis,
        dataImport: this.dataImport
      });
    }
  },

  selectInput: function(name) {
    var e = this.$('[name="'+ name +'"]')[0];
    if (!e) return;
    e.focus();
  },

  subtitleSuggestion: function() {
    this.model.subtitleSuggestion(true);
  },

  discard: function() {
    this.dataImport.discardData();
  },

  render: function() {
    RegionView.prototype.render.apply(this, arguments);
    this.stickit();
    return this;
  }
});

module.exports = ViewGraphicControls;

var Backbone = require('./core/backbone');
var GraphicType = require('./GraphicType.js');
var ViewGraphicTypes = require('./ViewGraphicTypes.js');
var ViewImportData = require('./ViewImportData.js');
var DataImport = require('./DataImport.js');
var ViewImportedData = require('./ViewImportedData.js');
var ViewInlineHelp = require('./ViewInlineHelp.js');
var Graphic = require('./Graphic.js');
var ViewGraphicControls = require('./ViewGraphicControls.js');
var ViewSelectedVariation = require('./ViewSelectedVariation.js');
var Variations = require('./Variations.js');
var LineControls = require('./LineControls.js');

var _ =require('underscore');
var $ = require('jquery');

exports.main = function(){

  var graphic = new Graphic();
  var importdata = new DataImport();
  var graphicControls = new ViewGraphicControls({model: graphic, dataImport: importdata});

  document.getElementById('controls').appendChild(graphicControls.render().el);

  var types = new Backbone.Collection([
    new GraphicType({
      typeName: 'Line'
    }, {
      graphic: graphic,
      controls: new LineControls(),
      variations: Variations
    })
  ]);

  var charts = new ViewGraphicTypes({collection: types});
  document.getElementById('charts').appendChild(charts.render().el);

  var viewSelectedVariation;
  Backbone.on('selectVariation', function (variation, svg) {

    if (viewSelectedVariation) {
      if (viewSelectedVariation.model === variation) {
        return;
      } else {
        viewSelectedVariation.remove();
      }
    }

    if (!variation || !svg) {
      return;
    }

    viewSelectedVariation = new ViewSelectedVariation({model: variation, svg: svg});
    viewSelectedVariation.render();
    document.getElementById('selection').appendChild(viewSelectedVariation.el);
  });

  importdata.on('change:pipelineOptions', function (model, pipelineOption) {
    if (!pipelineOption) {
      graphic.set(graphic.defaults);
      return;
    }
    var expectedValues = _.pick(pipelineOption, 'title', 'subtitle', 'source', 'footnote');
    graphic.set(expectedValues);
  });

  importdata.on('change:data', function(model, data) {
    graphic.chart.dataset.set('rows', data);
  });

  var importdataView = new ViewImportData({model: importdata});
  document.getElementById('controls').appendChild(importdataView.render().el);

  // var importeddataView = new ViewImportedData({model: importdata});
  // document.getElementById('controls').appendChild(importeddataView.render().el);

  var setColumnAxis = function(column, value) {
    column.collection = null;
    var oldValue;
    var newValue = column.get('axis');
    if (typeof column._previousAttributes.axis !== 'undefined') {
      oldValue = column._previousAttributes.axis;
      if (oldValue && (newValue !== oldValue)) {
        if (oldValue === 'Y') {
          graphic.chart.yAxis.columns.remove(column);
        } else if (oldValue === 'Z') {
          graphic.chart.zAxis.columns.remove(column);
        }
      }
    }
    if (newValue) {
      if (newValue === 'Y') {
        graphic.chart.yAxis.columns.add(column);
      } else if (newValue === 'Z') {
        graphic.chart.zAxis.columns.add(column);
      }
    }
  };

  importdata.columns.on('change:axis', setColumnAxis);
  importdata.columns.on('reset', function() {

    var dims = {};

    importdata.columns.each(function (column) {
      var d = column.get('axis') || 'NONE';
      if (!dims[d]) dims[d] = [];
      d.collection = null;
      dims[d].push(column);
    });

    graphic.chart.unusedSeries.reset(dims.NONE||[]);

    if (dims.X && dims.X.length) {
      graphic.chart.xAxis.useColumn(dims.X[0]);
    } else {
      graphic.chart.xAxis.set(graphic.chart.xAxis.defaults);
    }
    graphic.chart.yAxis.columns.reset(dims.Y||[]);
    graphic.chart.zAxis.columns.reset(dims.Z||[]);
  });

  graphic.chart.yAxis.columns.on('change:isOther', function (model) {
    console.log('IS OTHERS', this.findWhere({isOther: true}));
  });

  importdata.columns.each(setColumnAxis);

  ViewInlineHelp.init();

  if (document.location.hash === '#test') {
    var fs = require('fs');
    var samplePipeline = fs.readFileSync(__dirname + '/sampledata/BigChinaSlowdown.txt', 'utf8');
    importdata.set({dataAsString: samplePipeline, type: 'text/plain'}, {validate: true});
  }

};

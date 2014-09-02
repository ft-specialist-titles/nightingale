var Backbone = require('./core/backbone');
var Dataset = require('./Dataset.js');
var GraphicType = require('./GraphicType.js');
var ViewGraphicTypes = require('./ViewGraphicTypes.js');
var ViewColumns = require('./ViewColumns.js');
var ViewDimensions = require('./ViewDimensions.js');
var Column = require('./Column.js');
var Dimension = require('./Dimension.js');
var CollectionView = require('./core/CollectionView.js');
var ViewImportData = require('./ViewImportData.js');
var DataImport = require('./DataImport.js');
var ViewImportedData = require('./ViewImportedData.js');
var ViewInlineHelp = require('./ViewInlineHelp.js');
var Graphic = require('./Graphic.js');
var ViewGraphicControls = require('./ViewGraphicControls.js');
var _ =require('underscore');
var $ = require('jquery');

exports.main = function(){

  var graphic = new Graphic();
  var graphicControls = new ViewGraphicControls({model: graphic});

  document.getElementById('controls').appendChild(graphicControls.render().el);

  var variations = new Backbone.Collection([
    {width: 400, height: 600, name: 'test'},
    {width: 272, height: 153, name: 'primary'},
    {width: 300, height: null, name: 'inline'},
    {width: 600, height: null, name: 'narrow-page'},
    {width: 972, height: null, name: 'wide-page'}
  ]);

  var types = new Backbone.Collection([
    new GraphicType({
      name: 'Line Chart',
      graphic: graphic,
      variations: variations
    })
  ]);

  var charts = new ViewGraphicTypes({collection: types});
  document.getElementById('charts').appendChild(charts.render().el);

  var importdata = new DataImport();

  importdata.on('change:pipelineOptions', function(model, pipelineOption) {
    var expectedValues = _.pick(pipelineOption, 'title', 'subtitle', 'source', 'footnote');
    graphic.set(expectedValues);
  });

  importdata.on('change:data', function(model, data) {
    graphic.chart.dataset.set('rows', data);
  });

  var importdataView = new ViewImportData({model: importdata});
  document.getElementById('controls').appendChild(importdataView.render().el);

  var importeddataView = new ViewImportedData({model: importdata});
  document.getElementById('controls').appendChild(importeddataView.render().el);

  var dimensions = new Backbone.Collection([
    (new Dimension({name: 'A'})),
    (new Dimension({name: 'B'})),
    (new Dimension({name: 'C'}))
  ]);

  var setColumnDimension = function(column, value) {
    console.log('setColumnDimension');
    var oldValue;
    var newValue = column.get('dimension');
    if (typeof column._previousAttributes.dimension !== 'undefined') {
      oldValue = column._previousAttributes.dimension;
      if (oldValue && (newValue !== oldValue)) {
        dimensions.findWhere({name:oldValue}).columns.remove(column);
        if (oldValue === 'A') {
          console.log('oldvalue A')
          graphic.chart.xAxis.columns.remove(column);
        } else if (oldValue === 'B') {
          console.log('oldvalue B')
          graphic.chart.yAxis.columns.remove(column);
        } else if (oldValue === 'C') {
          console.log('oldvalue C')
          graphic.chart.zAxis.columns.remove(column);
        } else {
          console.log('Old value else', oldValue)
        }
      }
    }
    if (newValue) {
      var dim = dimensions.findWhere({name: newValue});
      dim.columns.add(column);
      if (newValue === 'A') {
        console.log('new value A')
        graphic.chart.xAxis.columns.add(column);
      } else if (newValue === 'B') {
        console.log('new value B')
        graphic.chart.yAxis.columns.add(column);
      } else if (newValue === 'C') {
        graphic.chart.zAxis.columns.add(column);
      } else {
        console.log('new value C')
        console.log('New value else', newValue)
      }
    }
  };

  importdata.columns.on('change:dimension', setColumnDimension);
  importdata.columns.on('reset', function() {
    var dims = {};
    importdata.columns.each(function(column) {
      var d = column.get('dimension');
      if (!dims[d]) dims[d] = [];
      dims[d].push(column);
    });
    dimensions.each(function(dimension){
      var name = dimension.get('name');
      var axis;
      if (name === 'A') {
        console.log('is x axis');
        axis = 'x';
      } else if (name === 'B') {
        console.log('is y axis');
        axis = 'y';
      } else if (name === 'C') {
        console.log('is z axis');
        axis = 'z';
      } else {
        console.log('reset else')
      }

      if (axis) {
      axis = graphic.chart[axis + 'Axis'];
      }
      if (dims[name] && dims[name].length) {
        dimension.columns.reset(dims[name]);
        axis.columns.reset(dims[name]);
      } else {
        dimension.columns.reset([]);
        axis.columns.reset([]);
      }
    });
  });

  importdata.columns.on('change:isOther', function(model) {
    console.log('IS OTHERS', this.findWhere({isOther: true}));
  });

  importdata.columns.each(setColumnDimension);


  var dimensionView = new ViewDimensions({
    collection: dimensions
  });
  document.getElementById('controls').appendChild(dimensionView.render().el);

  var inlineHelp = new ViewInlineHelp({
    el: document.body
  });

  inlineHelp.render();

  var fs = require('fs');
  var samplePipeline = fs.readFileSync(__dirname + '/sampledata/BigChinaSlowdown.txt', 'utf8');
  importdata.set({dataAsString: samplePipeline, type: 'text/plain'}, {validate: true});

};

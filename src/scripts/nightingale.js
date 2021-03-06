/* globals location */
var Backbone = require('./core/backbone');
var Graphic = require('./models/Graphic.js');
var ViewGraphicControls = require('./views/GraphicControls.js');
var ViewGraphicTypes = require('./views/GraphicTypes.js');
var GraphicType = require('./models/GraphicType.js');
var DataImport = require('./models/import.js');
var ViewImportData = require('./views/ImportData.js');
var ViewInlineHelp = require('./views/InlineHelp.js');
var ViewSelectedVariation = require('./views/SelectedVariation.js');
var Variations = require('./charting/Variations.js');
var LineControls = require('./models/LineControls.js');
var ColumnControls = require('./models/ColumnControls.js');
var BarControls = require('./models/BarControls.js');
var transform = require('./transform/index.js');
var DataTypes = require('./charting/Datatypes.js');
var Authentication = require('./utils/authentication.js');

var oCharts = require('o-charts');
var _ = require('underscore');
var $ = require('jquery');

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function enableFeatures(){
    [].forEach.call(document.querySelectorAll('[data-feature]'), function(el){
        if (getParameterByName('feature') !== el.getAttribute('data-feature')){
            el.remove();
        }
    });
}

function init(email) {

    var graphic = new Graphic();
    var importData = new DataImport();
    var graphicControls = new ViewGraphicControls({model: graphic, dataImport: importData});

    window.email = email || 'anonymous';
    document.documentElement.classList.add('theme--ic');
    document.getElementById('controls').appendChild(graphicControls.render().el);

    // REFACTOR THIS into it's own custom collection
    var types = new Backbone.Collection([
        new GraphicType({
            typeName: 'Line'
        }, {
            graphic: graphic,
            // GraphicType should internally decide which type
            // of controls suits it
            controls: new LineControls(),
            variations: Variations
        }),
        new GraphicType({
            typeName: 'Column'
        }, {
            graphic: graphic,
            controls: new ColumnControls(),
            variations: Variations
        }),
        new GraphicType({
            typeName: 'Bar'
        }, {
            graphic: graphic,
            controls: new BarControls(),
            variations: Variations
        })
    ]);
    types.comparator = 'suitabilityRanking';

    var charts = new ViewGraphicTypes({collection: types});
    var chartsEl = document.getElementById('charts');
    chartsEl.classList.add('full');
    chartsEl.appendChild(charts.render().el);

    var viewSelectedVariation;
    Backbone.on('selectVariation', function (variation, el) {
        if (viewSelectedVariation) {
            if (viewSelectedVariation.model === variation) {
                return;
            } else {
                viewSelectedVariation.remove();
            }
        }

        [].forEach.call(document.body.querySelectorAll('.graphic-container.selected'), function(el){
            el.classList.remove('selected');
        });
        el.parentNode.classList.add('selected');

        if (!variation || !variation.get('svg')) {
            return;
        }

        viewSelectedVariation = new ViewSelectedVariation({model: variation});
        viewSelectedVariation.render();
        document.getElementById('selection').appendChild(viewSelectedVariation.el);
    });

    importData.on('change:pipelineOptions', function (model, pipelineOption) {
        if (!pipelineOption) {
            graphic.set(graphic.defaults);
            return;
        }
        var expectedValues = _.pick(pipelineOption, 'title', 'subtitle', 'source', 'footnote');
        graphic.set(expectedValues);
    });

    function reorderChartStyle(model) {
        var chartStyle = model.get('recommendedChartStyle');
        // and sort our chart types based on that.
        types.forEach(function(t) {
            if (t.get('typeName') === chartStyle) {
                t.set('suitabilityRanking', - 100, {silent : true});
                t.set('recommended', true);
            } else {
                t.set('suitabilityRanking', 100, {silent : true});
                t.set('recommended', false);
            }
        });
        types.sort();
    }

    importData.on('change:recommendedChartStyle', function(model, recommendedChartStyle) {
        // work out what style is recommended.
        reorderChartStyle(model);
    });

    importData.on('change:data', function (model, data) {
        // work out what style is recommended.
        reorderChartStyle(model);
        Backbone.trigger('changedData');
        // then set the data which triggers rendering
        graphic.chart.dataset.set('rows', data);
    });

    var importdataView = new ViewImportData({model: importData});
    document.getElementById('controls').appendChild(importdataView.render().el);

    var setColumnAxis = function (column, value) {
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

    importData.columns.on('change:axis', setColumnAxis);
    importData.columns.on('reset', function () {

        var dims = {};

        importData.columns.each(function (column) {
            var d = column.get('axis') || 'NONE';
            if (!dims[d]) dims[d] = [];
            d.collection = null;
            dims[d].push(column);
        });

        graphic.chart.unusedSeries.reset(dims.NONE || []);

        if (dims.X && dims.X.length) {
            graphic.chart.xAxis.useColumn(dims.X[0]);
        } else {
            graphic.chart.xAxis.set(graphic.chart.xAxis.defaults);
        }
        graphic.chart.yAxis.columns.reset(dims.Y || []);
        graphic.chart.zAxis.columns.reset(dims.Z || []);

    });

    // REFACTOR: isOther modelling is rubbish, doesn't really work.
    graphic.chart.yAxis.columns.on('change:isOther', function (model) {
        console.log('IS OTHERS', this.findWhere({isOther: true}));
    });

    function revertColumn(array, property) {
        var originalData = importData.get('originalData');
        return array.map(function (d, i) {
            d[property] = originalData[i][property];
            return d;
        });
    }

    // REFACTOR: this logic should be in a model somewhere.
    graphic.chart.xAxis.on('change:dataType change:dateFormat', function (model) {

        var property = model.get('property');
        var dataType = model.get('dataType');
        var currentDataset = importData.get('data');
        var dateFormat = model.get('dateFormat');
        var revertedDataset = revertColumn(currentDataset, property);

        graphic.chart.xAxis.attributes.units = importData.groupDates(dateFormat);

        if (DataTypes.isNumeric(dataType)) {
            transform.series(revertedDataset, property, transform.number());
        } else if (DataTypes.isTime(dataType) && dateFormat) {
            transform.series(revertedDataset, property, transform.time(dateFormat));
        }

        graphic.chart.dataset.set('rows', revertedDataset);
    });

    importData.columns.each(setColumnAxis);

    ViewInlineHelp.init();

    // REFACTOR: move this into a separate application
    var fs = require('fs');
    var testSets = [
        fs.readFileSync(__dirname + '/sampledata/BigChinaSlowdown.txt', 'utf8'),
        fs.readFileSync(__dirname + '/sampledata/intraday.txt', 'utf8'),
        fs.readFileSync(__dirname + '/sampledata/categories.tsv', 'utf8'),
        fs.readFileSync(__dirname + '/sampledata/monthly-ten-years.tsv', 'utf8')
    ];

    if (document.location.hash === '#test') {
        importData.set({dataAsString: testSets[0], type: 'text/plain'}, {validate: true});
    }

    if(document.location.hash === '#testType1') {
        importData.set({dataAsString: testSets[1], type: 'text/plain'}, {validate: true});
    }

    if(document.location.hash === '#testType2') {
        importData.set({dataAsString: testSets[2], type: 'text/plain'}, {validate: true});
    }

    if(document.location.hash === '#testType3') {
        importData.set({dataAsString: testSets[3], type: 'text/plain'}, {validate: true});
    }

    document.querySelector('button[name="demo-data"]').addEventListener('click', function() {
        importData.set({dataAsString: testSets[0], type: 'text/plain'}, {validate: true});
    });
    enableFeatures();
}

function nightingale() {
    window.nightingale = {
        oChartsVersion: oCharts.version,
        init: oCharts.addFont(['MetricWebSemiBold','MetricWeb','BentonSans']).then(new Authentication(init))
    };
}

module.exports = nightingale;

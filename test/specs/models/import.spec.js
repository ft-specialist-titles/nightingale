var DataImport = require('../../../src/scripts/models/import');
var fs = require('fs');

describe('Import Model', function() {

  describe('Recommended Chart type', function() {
    var model, samplePipeline;

    beforeEach(function() {
      model = new DataImport();

      // polyfill console.table
      console.table = function() {};

    });

    it('should be line when more than 15 time intervals', function(done) {
      model.on('change:data', function(model, data) {
        expect(model.get('recommendedChartStyle')).toEqual('Line');
        done();
      });
      samplePipeline = fs.readFileSync(__dirname + '/../../fixtures/intraday.txt', 'utf8');
      model.set({dataAsString: samplePipeline, type: 'text/plain'}, {validate: true});
    });

    it('should be column when category chart', function(done) {
      model.on('change:data', function(model, data) {
        expect(model.get('recommendedChartStyle')).toEqual('Column');
        done();
      });
      samplePipeline = fs.readFileSync(__dirname + '/../../fixtures/categories.tsv', 'utf8');
      model.set({dataAsString: samplePipeline, type: 'text/plain'}, {validate: true});
    });

    it('should be column when monthly and less than 15 month span', function(done) {
      model.on('change:data', function(model, data) {
        expect(model.get('recommendedChartStyle')).toEqual('Column');
        done();
      });
      samplePipeline = fs.readFileSync(__dirname + '/../../fixtures/monthly-one-year.tsv', 'utf8');
      model.set({dataAsString: samplePipeline, type: 'text/plain'}, {validate: true});
    });

    it('should be column when quarterly and less than 15 quarter span', function(done) {
      model.on('change:data', function(model, data) {
        expect(model.get('recommendedChartStyle')).toEqual('Column');
        done();
      });
      samplePipeline = fs.readFileSync(__dirname + '/../../fixtures/quarterly-tough.tsv', 'utf8');
      model.set({dataAsString: samplePipeline, type: 'text/plain'}, {validate: true});
    });

    it('should be column when yearly and less than 15 year span', function(done) {
      model.on('change:data', function(model, data) {
        expect(model.get('recommendedChartStyle')).toEqual('Column');
        done();
      });
      samplePipeline = fs.readFileSync(__dirname + '/../../fixtures/yearly.tsv', 'utf8');
      model.set({dataAsString: samplePipeline, type: 'text/plain'}, {validate: true});
    });

    it('should be line when montly and more than 15 monthy span', function(done) {
      model.on('change:data', function(model, data) {
        expect(model.get('recommendedChartStyle')).toEqual('Line');
        done();
      });
      samplePipeline = fs.readFileSync(__dirname + '/../../fixtures/monthly-ten-years.tsv', 'utf8');
      model.set({dataAsString: samplePipeline, type: 'text/plain'}, {validate: true});
    });

  });

});
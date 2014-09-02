var Backbone = require('./core/backbone.js');
var Datatypes = require('./Datatypes.js');

var captitalizeFirstLetter = function(str) {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/^./, function (match) {
    return match.toUpperCase();
  });
}

var Dimension = Backbone.Model.extend({

  initialize: function () {
    this.columns = new Backbone.Collection();
    this.listenTo(this.columns, 'reset', function(){
      var name = this.get('name');
      this.set(this.defaults, {silent: true});
      this.set({name: name}, {silent: true});
    });
    this.listenTo(this.columns, 'add remove reset', function(){
      var numCols = this.columns.length;
      var warning = '';
      if (numCols === 1) {
        var column = this.columns.at(0);
        var typeInfo = column.get('typeInfo');
        this.set({
          datatype: typeInfo.datatype,
          suggestedLabel: captitalizeFirstLetter(column.get('property'))
        });
      } else if (numCols > 1) {
        var current;
        var last;
        for (var i = numCols;i--;) {
          current = this.columns.at(i).get('typeInfo').datatype;
          if (last && current && current !== last) {
            warning = 'Mismatching datatypes';
            break;
          }
          last = current;
        }
        this.set('suggestedLabel', '');
      }
      this.set('warningMessage', warning);
    });
    this.listenTo(this.columns, 'all', function(){
      var length = this.columns ? this.columns.length : 0;
      this.set({hasSeries: !!length, multiseries: length > 1, numSeries: length});
    });
  },

  defaults: {
    hasSeries: false,
    multiseries: false,
    numSeries: 0,
    name: '',
    label: '',
    labelOverride: false,
    suggestedLabel: '',
    datatype: Datatypes.CATEGORICAL,
    warningMessage: ''
  }
});

module.exports = Dimension;

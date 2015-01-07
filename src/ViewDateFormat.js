var Backbone = require('./core/backbone.js');

var formats = new Backbone.Collection([
  {value: '', label: 'Pick a date format'},
  {value: '%Y', label: 'YYYY - eg 2014'},
  {value: '%m/%Y', label: 'MM/YYYY - eg 01 2014'},
  {value: '%b/%Y', label: 'Month YYYY - eg Jan 2014'},
  {value: '%b/%y', label: 'Month YY - eg Jan 14'},
  {value: '%d/%m/%Y', label: 'DD/MM/YYYY - eg 31/01/2014'},
  {value: '%d/%m/%y', label: 'DD/MM/YY - eg 31/01/14'},
  {value: '%x', label: 'MM/DD/YYYY - eg 01/31/2014'},
  {value: '%m/%d/%y', label: 'MM/DD/YY - eg 01/31/14'},
  {value: '%d/%B/%Y', label: 'Date Month YYYY (long) - eg 01 January 2014'},
  {value: '%d/%b/%Y', label: 'Date Month YYYY (short) - eg 01 Jan 2014'},
  {value: '%d/%m/%Y/%H/%M', label: 'Date Time (Short) - eg 31/01/2014 23:00'},
  {value: 'JAVASCRIPT', label: 'Date Time (Long) - eg Thu Jan 30 2014 23:00:00 GMT+0000 (GMT)'},
  {value: 'ISO', label: 'ISO 8601 - eg 2014-01-30T12:23:00.000Z'}
]);

var ViewDateFormat = Backbone.View.extend({

  className: 'view-dateformat',

  initialize: function() {
    this.formats = formats;
  },

  template: function() {
    return '<select name="dateFormat" class="form-control pull"></select>';
  },

  bindings: {
    ':el': {
      observe: 'dateFormat',
      update: function($el, val, model, options){
        if (val) {
          $el.removeClass('has-error');
        } else {
          $el.addClass('has-error');
        }
      }
    },
    '[name="dateFormat"]': {
      observe: 'dateFormat',
      selectOptions: {
        collection: 'this.formats',
        labelPath: 'label',
        valuePath: 'value'
      }
    }
  },

  render: function() {
    this.el.innerHTML = this.template();
    this.stickit();
    return this;
  }
});

module.exports = ViewDateFormat;

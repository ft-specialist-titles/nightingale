var Backbone = require('./../core/backbone.js');
var Errors = require('./../errors/index.js');

var formats = new Backbone.Collection([
    {value: '', label: 'Pick a date format'},
    {value: '%d/%m/%Y', label: 'DD/MM/YYYY - eg 31/01/2015'},
    {value: '%x', label: 'MM/DD/YYYY - eg 01/31/2015'},
    {value: '%Y', label: 'YYYY - eg 2015'},
    {value: '%m/%Y', label: 'MM/YYYY - eg 01 2015'},
    {value: '%b/%Y', label: 'Month YYYY - eg Jan 2015'},
    {value: '%b/%y', label: 'Month YY - eg Jan 14'},
    {value: '%Y/%m/%d', label: 'YYYY/MM/DD - eg 2014/11/28'},
    {value: '%d/%m/%y', label: 'DD/MM/YY - eg 31/01/14'},
    {value: '%m/%d/%y', label: 'MM/DD/YY - eg 01/31/14'},
    {value: '%d/%B/%Y', label: 'Date Month YYYY (long) - eg 01 January 2015'},
    {value: '%d/%b/%Y', label: 'Date Month YYYY (short) - eg 01 Jan 2015'},
    {value: '%d/%b/%y', label: 'Date Month YY (short) - eg 01 Jan 15'},
    {value: '%B/%d/%Y', label: 'Month Date YYYY (long) - eg January 01 2015'},
    {value: '%b/%d/%Y', label: 'Month Date YYYY (short) - eg Jan 01 2015'},
    {value: '%d/%m/%Y/%H:%M', label: 'Date Time (Short) - eg 31/01/2015 23:00'},
    {value: '%d/%b/%Y/%H:%M', label: 'Date Month (Short) Time - eg 31/Mar/2015 23:00'},
    {value: '%d/%m/%Y/%H:%M:%S', label: 'Date Time with seconds - eg 31/01/2015 23:00:59'},
    {value: '%H:%M', label: 'Time only - 23:00'},
    {value: 'JAVASCRIPT', label: 'Date Time (Long) - eg Thu Jan 30 2015 23:00:00 GMT+0000 (GMT)'},
    {value: 'ISO', label: 'ISO 8601 - eg 2015-01-30T12:23:00.000Z'},
    {value: '%q/%y', label: 'Quarters with short year last - eg Q1 05'},
    {value: '%q/%Y', label: 'Quarters with Long year last - eg Q1 2005'},
    {value: '%y/%q', label: 'Quarters with short year first - eg 05 Q1'},
    {value: '%Y/%q', label: 'Quarters with Long year first - eg 2005 Q1'}
]);

var ViewDateFormat = Backbone.View.extend({

    className: 'view-dateformat',

    initialize: function () {
        this.formats = formats;
        this.listenTo(Backbone, 'changedData', this.showErrorPopover.bind(this));
        this.listenTo(Backbone, 'dateFormat_visible', this.showErrorPopover.bind(this));
        this.listenTo(Backbone, 'importVisible', this.hideErrorPopover.bind(this));
        this.listenTo(this.model, 'change:dateFormat', this.showErrorPopover.bind(this));
    },

    isVisible: function() {
        var self = this;
        var isVisible = self.$el.is(':visible');
        var overlay = document.querySelector('.view-importdata');
        var isCovered = overlay.style.display !== 'none';
        return isVisible && !isCovered;
    },

    showErrorPopover: function() {
        var self = this;
        var select = self.$el.find('select');
        if (self.tm) {
            clearTimeout(self.tm);
        }
        self.tm = setTimeout(function() {
            if (!self.model.get('dateFormat') && self.isVisible()) {
                select.popover('show');
            } else {
                select.popover('hide');
            }
            self.tm = null;
        }, 500);
    },

    hideErrorPopover: function() {
        var select = this.$el.find('select');
        select.popover('hide');
    },


    template: function () {
        return '<label>Date format</label><select data-container="body" name="dateFormat" class="form-control pull"></select>';
    },

    bindings: {
        ':el': {
            observe: 'dateFormat',
            update: function ($el, val, model, options) {
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

    render: function () {
        this.el.innerHTML = this.template();
        this.$el.find('select').popover({
            html: true,
            trigger: 'manual',
            template: Errors.error_template,
            content: Errors.NO_DATE_FORMAT
        });
        this.stickit();
        return this;
    }
});

module.exports = ViewDateFormat;

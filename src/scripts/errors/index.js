var _ = require('underscore');

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

module.exports = {
    error_template: '<div class="popover alert-danger" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
    NO_DATE_FORMAT: '<p>We were unable to automatically guess the <strong>date format</strong> from your data.</p><p>Please select one from this list</p>',
    NO_COLUMN_PICKED: '<p>We were unable to automatically guess the <strong>independent axis column</strong> in your data.</p><p>Please select one from this list</p>'
};

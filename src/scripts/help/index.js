var _ = require('underscore');

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

module.exports = {
    WHAT_IS_CSV: '<p>Comma Separated Values (CSV) files are used to store tabular data in plain text form.<p><p>Most spreadsheet applications can "save as" CSV.<p>Here\'s an example:<pre>Countries,      GDP Per Captia<span class="pilcrow">\n</span>United States,  "53,142"<span class="pilcrow">\n</span>United Kingdom, "39,351"<span class="pilcrow">\n</span>Germany,        "45,085"</pre>',
    WHAT_IS_TSV: '<p>Tab Separated Values (TSV) files are similar to CSV files. They are used to store tabular data in plain text form.<p><p>When you copy and paste cells from Excel the format used is TSV.<p><p>Here\'s an example:<pre>Countries<span class="tsv-tab">\t</span>GDP Per Captia<span class="pilcrow">\n</span>United States<span class="tsv-tab">\t</span>"53,142"<span class="pilcrow">\n</span>United Kingdom<span class="tsv-tab">\t</span>"39,351"<span class="pilcrow">\n</span>Germany<span class="tsv-tab">\t</span>        "45,085"</pre>',
    INTRADAY: '<p>An intra-day scale is used for financial data which has gaps while the market is closed, so that it can be displayed as a continuous line</p><p>Using this option on non intra-day data might have unexpected results</p>',
    MASTER: '<p><strong>Master Images in Méthode:</strong></p><p>Méthode master will only work with .png files.</p><ul style="padding:1em"><li>Drag the saved chart into the <code>/FT/Graphics/Online/<wbr>Master_2048x1152/yyyy/mm/</code> folder within Méthode.</li><li>In the Methode story, drag the chart into the master image slot</li><li>Ensure the story Metadata is set to <code>Article image</code>.</li></ul></p>',
    LINE_SERIES: _.template('<p>Line data series&nbsp;{{ index }}</p>'),
    BAR_SERIES: _.template('<p>Bar/area data series&nbsp;{{ index }}</p>')
};

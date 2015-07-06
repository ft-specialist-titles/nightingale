var urlRequired = 'http://localhost:3000/';

module.exports = {

    'Initiate Test': function (browser) {
        console.log("===================================\n" +
            ">> Starting import-data-splash-page.js\n" +
            "===================================");
        browser
            .url(urlRequired)
            .assert.urlEquals(urlRequired)
            .assert.title(urlRequired)
    },

    'Check All Containers' : function (browser) {
        browser
            .assert.visible('#controls')
            .assert.visible('#controls div[class="fake-field"]')
    },

    'Confirm All Elements' : function (browser) {
        browser
            .assert.containsText('#controls div[class="fake-field"] p', 'Copy and paste a range of cells from Excel...')
            .assert.attributeContains('#controls button[class="btn btn-link"]', 'name', 'select-file')
            .assert.attributeContains('#controls a[data-help="WHAT_IS_CSV"]', 'href', 'http://en.wikipedia.org/wiki/Comma-separated_values')
            .assert.attributeContains('#controls a[data-help="WHAT_IS_TSV"]', 'href', 'http://en.wikipedia.org/wiki/Tab-separated_values')
    },
    after : function(browser) {
        browser.end();
        console.log("===================================\n" +
            ">> Ending import-data-splash-page.js\n" +
            "===================================")
    }
};

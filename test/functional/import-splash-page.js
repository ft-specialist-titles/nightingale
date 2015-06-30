var urlRequired = 'http://localhost:3000/';

module.exports = {

    'Initiate Test': function (browser) {
        console.log("===================================\n" +
            ">> Starting import-splash-page.js\n" +
            "===================================");
        browser
            .url(urlRequired)
            .assert.urlEquals(urlRequired)
            .assert.title(urlRequired)
    },

    'Check All Containers' : function (browser) {
        browser
            .assert.visible('#controls')
            .assert.visible('#controls > div.view-importdata > div > div.fake-field')
    },

    'Confirm All Elements' : function (browser) {
        browser
            .assert.containsText('#controls > div.view-importdata > div > div.fake-field > p', 'Copy and paste a range of cells from Excel...')
            .assert.attributeContains('#controls > div.view-importdata > div > div:nth-child(4) > p > button', 'name', 'select-file')
            .assert.attributeContains('#controls > div.view-importdata > div > div:nth-child(4) > p > a:nth-child(2)', 'href', 'http://en.wikipedia.org/wiki/Comma-separated_values')
            .assert.attributeContains('#controls > div.view-importdata > div > div:nth-child(4) > p > a:nth-child(3)', 'href', 'http://en.wikipedia.org/wiki/Tab-separated_values')
    },
    after : function(browser) {
        browser.end();
        console.log("===================================\n" +
            ">> Ending import-splash-page.js\n" +
            "===================================")
    }
};

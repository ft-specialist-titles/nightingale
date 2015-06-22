var urlRequired = 'http://localhost:3000/';

function assertTitleOfChart (browser, charts) {
    var chartNames = ['large', 'regular', 'small'];
    browser.waitForElementVisible('#charts > div > div:nth-child(1) > div > div.view-graphic-variation.large.web.inline > div > svg', 5000);

    for (i = 0; i <3; i++) {
        for (j in chartNames) {
            browser.assert.attributeContains('#charts > div > div:nth-child(' + (i + 1) + ') > div > div.view-graphic-variation.' + chartNames[j] + '.web.inline > div > svg', 'class', charts[i])
        }
    }
}

module.exports = {

    'Initiate Test': function (browser) {
        console.log("===================================\n" +
            ">> Starting import-data.js\n" +
            "===================================");
        browser
            .url(urlRequired)
            .waitForElementVisible('#controls > div.view-importdata > div > div.feedback-details > a', 6000)
    },

    'Importing Data, Type 1: line-chart': function (browser) {
        var charts = ['line-chart', 'column-chart', 'bar-chart', 'Line chart'];
        browser
            .url(urlRequired + '?1#testType1')
            .expect.element('#charts > div > div:nth-child(1) > h2 > small').text.equal(charts[3]).visible.before(5000);
        assertTitleOfChart(browser, charts)
    },

    // Below is XPath example
    'Importing Data, Type 2: column-chart': function (browser) {
        var charts = ['column-chart', 'line-chart', 'bar-chart', 'Column chart'];
        browser
            .url(urlRequired + '?2#testType2')
            .expect.element('#charts > div > div:nth-child(1) > h2 > small').text.equal(charts[3]).visible.before(5000);

        assertTitleOfChart(browser, charts)
    },

    after : function(browser) {
        browser.end();
        console.log("===================================\n" +
            ">> Ending import-data.js\n" +
            "===================================")
    }
};

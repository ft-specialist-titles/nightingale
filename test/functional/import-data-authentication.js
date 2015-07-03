var urlRequired = 'http://localhost:3000/';
var chartNames = ['large', 'regular', 'small'];

function assertElementInChart (browser, type, expectedText){
    browser.pause(1500);
    for (i = 0; i <3; i++) {
        for (j in chartNames) {
            browser.assert.containsText('#charts > div > div:nth-child(' + (i+1) + ') > div > div.view-graphic-variation.' + chartNames[j] + '.web.inline > div > svg > g.chart-' + type + ' > g > text', expectedText)
        }
    }
}

function assertElementInChartDebug (browser, type, expectedText){
    browser.pause(1000);
    for (i = 0; i <3; i++) {
        for (j in chartNames) {
            browser.getText('#charts > div > div:nth-child(' + (i+1) + ') > div > div.view-graphic-variation.' + chartNames[j] + '.web.inline > div > svg > g.chart-' + type + ' > g > text', function(result){
                browser.assert.equal(result.value.replace(/ /g, ''), 'Source:' + expectedText.replace(/ /g, ''))
            });
        }
    }
}

function assertLineThicknessInChart (browser, expectedThickness){
    browser.pause(500);
    for (j in chartNames) {
        browser.expect.element('#charts > div > div:nth-child(1) > div > div.view-graphic-variation.' + chartNames[j] + '.web.inline > div > svg > g.chart > g.plot > path').attribute('stroke-width').equals(expectedThickness)
    }
}

function assertAxisFlipped (browser, expectedX){
    browser.pause(500);
    for (j in chartNames) {
        if (chartNames[j] == 'small'){
            browser.expect.element('#charts > div > div:nth-child(1) > div > div.view-graphic-variation.' + chartNames[j] + '.web.inline > div > svg > g.chart > g:nth-child(2) > g > g > g:nth-child(4) > text').attribute('x').equals(expectedX)
        } else {
            browser.expect.element('#charts > div > div:nth-child(1) > div > div.view-graphic-variation.' + chartNames[j] + '.web.inline > div > svg > g.chart > g:nth-child(2) > g > g > g:nth-child(6) > text').attribute('x').equals(expectedX)
        }
    }
}

function assertValuesRounded (browser, expectedBaseline){
    browser.pause(500);
    for (j in chartNames) {
        if (chartNames[j] != 'small'){
            browser.expect.element('#charts > div > div:nth-child(1) > div > div.view-graphic-variation.' + chartNames[j] + '.web.inline > div > svg > g.chart > g:nth-child(2) > g > g > g.tick.origin').text.equals(expectedBaseline);
        }
    }
}

module.exports = {

    'Initiate Test': function (browser) {
        console.log("===================================\n" +
            ">> Starting import-data-authentication.js\n" +
            "===================================");
        browser
            .url(urlRequired + '?3#testType3')
            .expect.element('#charts > div > div:nth-child(1) > h2 > small').text.equal('Line chart').visible.before(5000);
    },

    'Importing Data, Playing with Left-Hand Elements': function (browser) {
        var expectedText;

        expectedText = 'My chart title &&83';
        browser
            .clearValue('#controls > div.view-graphic-controls > div.axis-panel.panel.panel-default > div.panel-body > form > div:nth-child(1) > input')
            .setValue('#controls > div.view-graphic-controls > div.axis-panel.panel.panel-default > div.panel-body > form > div:nth-child(1) > input', expectedText);
        assertElementInChart(browser, 'title', expectedText);

        expectedText = 'My VERY OWN chart 11$9.9';
        browser.setValue('#controls > div.view-graphic-controls > div.axis-panel.panel.panel-default > div.panel-body > form > div:nth-child(2) > input', expectedText);
        assertElementInChart(browser, 'subtitle', expectedText);

        expectedText = 'Not sure what it shows?';
        browser.setValue('#controls > div.view-graphic-controls > div.axis-panel.panel.panel-default > div.panel-body > form > div:nth-child(3) > input', expectedText);
        assertElementInChart(browser, 'footnote', expectedText);

        expectedText = '£30 Financial Times';
        browser.setValue('#controls > div.view-graphic-controls > div.axis-panel.panel.panel-default > div.panel-body > form > div:nth-child(4) > input', expectedText);
        assertElementInChart(browser, 'source', expectedText);

        expectedText = '£30 Financial Times, Thomson Reuters Datastream, Bloomberg, World Bank, IMF, ONS, Eurostat, US Census Bureau, US Bureau of Labor Statistics';
        for (i = 0; i < 8; i++) {
            browser.click('#controls > div.view-graphic-controls > div.axis-panel.panel.panel-default > div.panel-body > form > div:nth-child(4) > p > button:nth-child(' + (i + 1) + ')')
        }
        assertElementInChartDebug(browser, 'source', expectedText);

    },

    'Importing Data, Playing with Right-Hand Elements': function (browser) {
        browser.pause(1000)
            .click('#charts > div > div:nth-child(1) > div > div.view-graphic-variation.large.web.inline')
            .expect.element('#selection > div > div > div:nth-child(1) > div.panel-heading').visible.before(3000);
    },


    'Holding Data, Playing with Right-Hand Elements': function (browser) {
        assertAxisFlipped(browser, 3);
        browser.click('#selection input[name="dependentAxisOrient"]');
        assertAxisFlipped(browser, -3);
        // note: left hand side not flipped because the overlay interferes with automation checking - NIGHTWATCH BUG

        assertValuesRounded(browser, 0.5);
        browser.click('#selection input[name=nice]');
        assertValuesRounded(browser, 0);
        browser.click('#selection input[name=nice]');

        assertValuesRounded(browser, 0.5);
        browser.click('#selection input[name="startFromZero"]');
        assertValuesRounded(browser, 0);
        browser.click('#selection input[name="startFromZero"]');

        browser.click('#selection input[name="dependentAxisOrient"]');

        assertLineThicknessInChart(browser, 4);
        browser.click('#selection input[name=thinLines]');
        assertLineThicknessInChart(browser, 2);
        browser.click('#selection input[name=thinLines]');
    },

    after : function(browser) {
        browser.end();
        console.log("===================================\n" +
            ">> Ending import-data-authentication.js\n" +
            "===================================")
    }
};

var urlRequired = 'http://localhost:3000/';
var chartNames = ['large', 'regular', 'small'];
var expectedText;

function assertElementInChart (browser, type, expectedText){
    browser.pause(1750); //todo: add 'waitFor' rather than arbitrary pause
    for (var i = 0; i <3; i++) {
        for (var j in chartNames) {
            browser.assert.containsText('.' + chartNames[j] + ' svg g.chart-' + type + ' text', expectedText)
        }
    }
}


function assertLineThicknessInChart (browser, expect){
    browser.pause(500);
    browser.expect.element('.small svg g.plot path').attribute('stroke-width').equals(expect);
    browser.expect.element('.regular svg g.plot path').attribute('stroke-width').equals(expect);
    browser.expect.element('.large svg g.plot path').attribute('stroke-width').equals(expect);
}

function assertAxisFlipped (browser, expect){
    browser.pause(500);
    browser.expect.element('.small svg .axis.y .tick:nth-child(4) text').attribute('x').equals(expect);
    browser.expect.element('.regular svg .axis.y .tick:nth-child(6) text').attribute('x').equals(expect);
    browser.expect.element('.large svg .axis.y .tick:nth-child(6) text').attribute('x').equals(expect);
}

function assertValuesRounded (browser, expect){
    browser.pause(500);
    browser.expect.element('.regular svg.line-chart .tick.origin text').text.equals(expect);
    browser.expect.element('.large svg.line-chart .tick.origin text').text.equals(expect);
}

module.exports = {

    'Initiate Test': function (browser) {
        console.log("===================================\n" +
            ">> Starting chart-import-data.js\n" +
            "===================================");
        browser
            .url(urlRequired + '?3#testType3')
            .expect.element('#charts h2 small').text.equal('Line chart').visible.before(5000);
    },

    'Import Data, Title': function (browser) {
        expectedText = 'My chart title &&83';
        browser
            .clearValue('#controls input[name="title"]')
            .setValue('#controls input[name="title"]', expectedText);
        assertElementInChart(browser, 'title', expectedText);
    },

    'Import Data, Subtitle': function (browser) {
        expectedText = 'My VERY OWN chart 11$9.9';
        browser.setValue('#controls input[name="subtitle"]', expectedText);
        assertElementInChart(browser, 'subtitle', expectedText);
    },

    'Import Data, Footnote': function (browser) {
        expectedText = 'Not sure what it shows?';
        browser.setValue('#controls input[name="footnote"]', expectedText);
        assertElementInChart(browser, 'footnote', expectedText);
    },

    'Import Data, Source': function (browser) {
        expectedText = '£30FinancialTimes';
        browser.setValue('#controls input[name="source"]', expectedText);
        assertElementInChart(browser, 'source', expectedText);

        expectedText = '£30 Financial Times, Thomson Reuters Datastream, Bloomberg, World Bank, IMF, ONS, Eurostat, US Census Bureau, US Bureau of Labor Statistics';
        for (var i = 0; i < 8; i++) {
            browser
                .click('#controls button.popular-source:nth-child(' + (i + 1) + ')');

        }
        browser.pause(1750);
        for (var i = 0; i <3; i++) {
            for (var j in chartNames) {
                browser.getText('.' + chartNames[j] + ' svg  g.chart-source text', function(result){
                    browser.assert.equal(result.value.replace(/ /g, ''), 'Source:' + expectedText.replace(/ /g, ''));
                });
            }
        }
    },

    'Opening Right Panel': function (browser) {
        browser.pause(1000)
            .click('#charts div.view-graphic-variation.large.web.inline svg[class="graphic line-chart"]')
            .expect.element('#selection div:nth-child(1) > div.panel-heading').visible.before(3000);
    },

    'Right Panel, Left Align Y Axis' : function (browser) {
        assertAxisFlipped(browser, 3);
        browser.click('#selection input[name="dependentAxisOrient"]');
        assertAxisFlipped(browser, -3);
        // note: left hand side not flipped because the overlay interferes with automation checking - NIGHTWATCH BUG
    },

    'Right Panel, Round Y Values' : function (browser) {
        assertValuesRounded(browser, 0.5);
        browser.click('#selection input[name="nice"]');
        assertValuesRounded(browser, 0);
        browser.click('#selection input[name="nice"]');
    },

    'Right Panel, Start Y Axis from 0' : function (browser) {
        assertValuesRounded(browser, 0.5);
        browser.click('#selection input[name="startFromZero"]');
        assertValuesRounded(browser, 0);
        browser.click('#selection input[name="startFromZero"]');

        browser.click('#selection input[name="dependentAxisOrient"]');
    },

    'Thin Lines' : function (browser) {
        assertLineThicknessInChart(browser, 4);
        browser.click('#selection input[name=thinLines]');
        assertLineThicknessInChart(browser, 2);
        browser.click('#selection input[name=thinLines]');
    },

    after : function(browser) {
        browser.end();
        console.log("===================================\n" +
            ">> Ending chart-import-data.js\n" +
            "===================================")
    }
};

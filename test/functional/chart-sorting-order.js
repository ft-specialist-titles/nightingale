var urlRoot = 'http://localhost:3000';


module.exports = {

    'Recommended chart should be at the top of the chart list' : function(browser) {


        var discardButton = 'button[name="discard"]';
        var demoButton = 'button[name="demo-data"]';

        browser.url(urlRoot + '/?1#testType1')
            .assert
            .containsText('div.view-graphic-variation-collection:first-child h2', 'Recommended')
            .waitForElementVisible(discardButton, 10000)
            .click(discardButton)
            .waitForElementVisible(demoButton, 10000)
            .click(demoButton)
            .pause(1000)
            .assert
            .containsText('div.view-graphic-variation-collection:first-child h2', 'Recommended')
            .end()

    }

}

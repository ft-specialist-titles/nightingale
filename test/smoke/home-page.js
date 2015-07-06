var urlRequired = 'http://nightingale.ft.com/';

module.exports = {

    'Initiate Test': function (browser) {
        console.log("===================================\n" +
            ">> Starting home-page.js\n" +
            "===================================");
        browser
            .url(urlRequired)
            .assert.urlEquals(urlRequired)
            .assert.title(urlRequired)
            .waitForElementVisible('#my-signin2', 6000)
    },

    'Check All Containers' : function (browser) {
        browser
            .assert.visible('#login-overlay')
            .assert.visible('#login-container')
            .assert.visible('#my-signin2')
    },

    'Confirm All Elements' : function (browser) {
        browser
            .assert.containsText('#login-overlay', 'Nightingale')
            .assert.containsText('#login-overlay p', 'requires a login with your FT credentials')
            .assert.containsText('#trouble a', 'Trouble signing in?')
            .assert.attributeContains('#login-container a', 'href', 'help.nightingale@ft.com')
            .assert.attributeContains('#trouble a', 'href', '#trouble')
    },

    'Login to Google' : function (browser) {
        browser
            .click('#my-signin2 div[class="abcRioButtonContentWrapper"]')
            .pause(500);
        browser.window_handles(function(result){
            browser.switchWindow(result.value[1])
        });
        browser.assert.title('Sign in - Google Accounts')
    },

    after : function(browser) {
        browser.end();
        console.log("===================================\n" +
            ">> Ending home-page.js\n" +
            "===================================")
    }
};

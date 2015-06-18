
var folderDate = require('./testResources/folder-date.js');
var folderToLog = './test/smoke/testResources/' + folderDate;
var urlToFind = 'http://nightingale.ft.com/';

casper.options.viewportSize = {width: 1366, height: 768};
casper.options.logLevel = 'debug';
casper.options.verbose = false;

// Casper: go to webpage and assert that it's live
casper.start(urlToFind, function bootUpCasper() {
    this.echo(">> Starting tests");
    this.test.assertHttpStatus(200, 'website is live');
});

// Casper: find URL and assert title & url remains correct
casper.then(function testBasicDetails() {
    this.test.assert(this.getCurrentUrl() === urlToFind, 'url is ' + urlToFind);
    this.test.assert(this.getTitle() === '', 'title is blank');
});


// Casper: wait for google sign in button to appear
casper.waitForSelector(".abcRioButtonContentWrapper", function waitForGoogleSignIn() {
    this.capture(folderToLog + 'liveWebsite.png');
}, function onTimeout() {
    console.error('the google sign in never correctly loaded');
}, 10000);

// Casper: check that all containers exist
casper.then(function confirmAllContainers() {
    this.test.assertVisible('#login-overlay','login-overlay exists');
    this.test.assertVisible('#login-container','login-container exists');
    this.test.assertVisible('#my-signin2','google sign on button exists');
});

// Casper: check that all elements exist and are expected
casper.then(function confirmAllElements() {
    this.test.assertSelectorHasText('#login-overlay', 'Nightingale', 'nightingale text exists');
    this.test.assertSelectorHasText('#login-overlay > p', 'requires a login with your FT credentials', 'requires login text exists');
    this.test.assertSelectorHasText('#trouble > p:nth-child(1) > a', 'Trouble signing in?', 'trouble signing in text exists');
    this.test.assert(this.getElementAttribute('#login-container > div.feedback-details > a', 'href') === "mailto:help.nightingale@ft.com", 'mailto link exists');
    this.test.assert(this.getElementAttribute('#trouble > p:nth-child(1) > a', 'href') === "#trouble", 'trouble signing in link exists');
});

// Casper: click google sign in
casper.then(function clickGoogleSignIn() {
    this.mouse.click(200, 300);
    //this.click('#my-signin2 > div > div');
});

// Casper: wait for google sign in popup
casper.waitForPopup(/ServiceLogin/, function findNewPopup(){
    this.test.assertEquals(this.popups.length, 1, 'google sign in caused a popup successfully');
});

// Casper: confirm google sign in popup
casper.withPopup(/ServiceLogin/, function handleScreenshot() {
    this.capture(folderToLog + 'googleSignInPopup.png');
    this.test.assert(this.getTitle() === 'Sign in - Google Accounts', 'google sign in popup title is as expected');
});

// Casper: perform end of test
casper.then(function breakDown() {
    this.echo(">> Test run finished");
    this.exit();
});

casper.run();


var folderDate = require('./../utils/folder-date.js');
var folderToLog = './test/functional/evidence/' + folderDate;
var urlToFind = 'http://localhost:3000/';

casper.options.viewportSize = {width: 1366, height: 768};
casper.options.logLevel = 'debug';
casper.options.verbose = false;

// Casper: boot up and wait for npm start to initialise
casper.start(urlToFind, function bootUpCasper() {
    this.wait(15000, function(){
    });
});

// Casper: go to webpage and asser that it's live
casper.thenOpen(urlToFind, function findUrl() {
    this.echo(">> Starting functional tests");
    this.test.assertHttpStatus(200, 'website is live');
});

// Casper: find URL and assert title & url remains correct
casper.then(function testBasicDetails() {
    this.test.assert(this.getCurrentUrl() === urlToFind, 'url is ' + urlToFind);
    this.test.assert(this.getTitle() === '', 'title is blank');
    this.capture(folderToLog + 'importSplashPage.png');
});

// Casper: check that all containers exist
casper.then(function confirmAllContainers() {
    this.test.assertVisible('#controls','controls container exists');
    this.test.assertVisible('#controls > div.view-importdata > div > div.fake-field', 'fake field exists');
});

// Casper: check that all elements exist and are expected
casper.then(function confirmAllElements() {
    this.test.assertSelectorHasText('#controls > div.view-importdata > div > div.fake-field > p', 'Copy and paste a range of cells from Excel...', 'fake field has correct text visible');
    this.test.assert(this.getElementAttribute('#controls > div.view-importdata > div > div:nth-child(4) > p > button', 'name') === "select-file", 'pick a file clickable exists');
    this.test.assert(this.getElementAttribute('#controls > div.view-importdata > div > div:nth-child(4) > p > a:nth-child(2)', 'href') === "http://en.wikipedia.org/wiki/Comma-separated_values", 'CSV link address is correct');
    this.test.assert(this.getElementAttribute('#controls > div.view-importdata > div > div:nth-child(4) > p > a:nth-child(3)', 'href') === "http://en.wikipedia.org/wiki/Tab-separated_values", 'TSV link address is correct');
});

// Casper: perform end of test
casper.then(function breakDown() {
    this.echo("==================================\n" +
        ">> Moving on to import-data.js script\n" +
        "==================================");
    this.exit();
});

casper.run();

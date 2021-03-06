require('./../polyfill/bind');

var shortDays = /^(mon|tue|wed|thu|fri|sat|sun)$/i;
var longDays = /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i;
var shortMonths = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)$/i;
var longMonths = /^(january|february|march|april|may|june|july|august|september|october|november|december)$/i;
// first letters of all months and days. ordered by amount of occurrences and then by months, days
var firstLetters = /[jmsfatondw]/;
var types = {
    'month':'month',
    'year':'year',
    'day':'day',
    'ampm':'ampm',
    'weekday':'weekday',
    'time':'time'
};

function normaliseSeperators(value) {
    if (!value) return null;
    return value.toString().trim().toLowerCase().replace(/[\/\ ]/g, '-');
}

function DateParts(value){
    this.parts = [];
    this.value = normaliseSeperators(value);
}

DateParts.prototype.isYears = function(value, tokens){
    //eg like 2000
    return (/^\d{4}$/.test(value));
};
DateParts.prototype.isShortYears = function(value, tokens){
    //eg like 02 or 99
    return (/^\d{1,2}$/.test(value));
};
DateParts.prototype.isMonths = function(value, tokens){
    //eg like jan
    return (this.isShortYears(value) && value<=12);
};
DateParts.prototype.isShortMonths = function(value, tokens){
    //eg like jan
    return (tokens.length === 2 && shortMonths.test(value));
};
DateParts.prototype.isQuarter = function(value, tokens){
    return (/[qQ][1234]/.test(value));
};
DateParts.prototype.isNumbersButNotYears = function(value, tokens){
    //eg 12345 or 1.1 or 1,000
    return (/^[\d\.\,]+$/.test(value));
};
DateParts.prototype.isUnknownMonthsAndYears = function(value, tokens){
    //eg like 00/00 or 14/14
    return tokens.length === 2 && /^\d{2}-\d{2}$/.test(value);
};
DateParts.prototype.isMonthsThenShortYears = function(value, tokens){
    //eg like 12/12
    return this.isUnknownMonthsAndYears(value, tokens) && parseInt(tokens[0]) <= 12;
};
DateParts.prototype.isMonthsThenYears = function(value, tokens){
    //eg like 12/12
    return tokens.length === 2 && this.isMonths(tokens[0]) && this.isYears(tokens[1]);
};

DateParts.prototype.matched = function(){
    var value = this.value;
    if (!value) return null;
    var tokens = value.split(/\-/g);
    var numTokens = tokens.length;

    if (this.isYears(value, tokens)) {
        return '%Y';
    } else if (this.isNumbersButNotYears(value, tokens)) {
        return null;
    } else if (this.isMonthsThenShortYears(value, tokens)) {
        return '%m/%y';
    } else if (this.isMonthsThenYears(value, tokens)) {
        return '%m/%Y';
    } else if (this.isUnknownMonthsAndYears(value, tokens)) {
        return null;
    } else if (this.isShortMonths(tokens[0], tokens) && this.isShortYears(tokens[1], tokens)) {
        return '%b/%y';
    } else if (this.isShortMonths(tokens[1], tokens) && this.isShortYears(tokens[0], tokens)) {
        return '%y/%b';
    } else if (this.isShortMonths(tokens[0], tokens) && this.isYears(tokens[1], tokens)) {
        return '%b/%Y';
    } else if (this.isShortMonths(tokens[1], tokens) && this.isYears(tokens[0], tokens)) {
        return '%Y/%b';
    } else if (this.isYears(tokens[0], tokens) && this.isMonths(tokens[1], tokens) && numTokens===2) {
        return '%Y/%m';
    } else if (this.isYears(tokens[0], tokens) && this.isQuarter(tokens[1], tokens) && numTokens===2) {
        return '%Y/%q';
    } else if (this.isShortYears(tokens[0], tokens) && this.isQuarter(tokens[1], tokens) && numTokens===2) {
        return '%y/%q';
    } else if (this.isYears(tokens[1], tokens) && this.isQuarter(tokens[0], tokens) && numTokens===2) {
        return '%q/%Y';
    } else if (this.isShortYears(tokens[1], tokens) && this.isQuarter(tokens[0], tokens) && numTokens===2) {
        return '%q/%y';
    }

    // trick the parser into thinking the last
    // token is a year if it matches the pattern 00-00-00
    if (numTokens === 3 && /^\d{2}-\d{2}-\d{2}$/.test(value)) {
        tokens[2] = '99';
    }

    var part;
    for (var i = 0; i < numTokens; i++) {
        part = new this.Part(tokens[i]);
        this.parts.push(part);
    }

    return false;
};

function timeParts(timeElements){
    var timeStrings =[];
    timeElements.reduce(function (result, timePart, i) {

        var len = timePart.length;
        var zulu = timePart.substr(len - 1) === 'Z';
        var lastTwo = timePart.substr(len - 2).toLowerCase();
        var am = lastTwo === 'am';
        var pm = lastTwo === 'pm';
        var ampm = am || pm;
        timePart = timePart.substring(0, zulu ? len - 1 : ampm ? len - 2 : undefined);
        var num = Number(timePart);
        var format;

        if (timePart === '' || isNaN(num)) {
            format = undefined;
        } else if (i === 0 && num >= 0 && num <= 23) {
            format = '%H';
        } else if (i === 1 && num >= 0 && num <= 59) {
            format = '%M';

            // How the hell can a minute have 61 seconds?!
            // https://docs.python.org/2/library/time.html
        } else if (i === 2 && num >= 0 && num <= 61) {
            if (/\d{2}\.\d{3}$/.test(timePart)) {
                format = '%S.%L';
            } else {
                format = '%S';
            }
        } else if (i === 3 && timePart.length === 3 && num >= 0 && num <= 999) {
            format = '%L';
        }

        if (zulu) {
            format += 'Z';
        } else if (ampm) {
            format += '%p';
        }

        timeStrings.push(format);

        return result;

    }, timeStrings);

    return timeStrings;
}

DateParts.prototype.Part = function(d) {

    var len = d.length;
    var zeroPadded = len === 2;
    this.num = NaN;
    this.type = null;
    this.format = null;
    this.guessYear = false;
    this.guessMonth = false;
    this.guessDay = false;
    this.twoDigit = false;

    this.guess = function () {
        return this.guessYear || this.guessMonth || this.guessDay;
    }.bind(this);

    if (/^\d{3,4}$/.test(d)) {
        this.type = types.year;
        this.format = '%Y';
        this.num = parseInt(d);
    } else if (/^\d{1,2}$/.test(d)) {

        this.twoDigit = zeroPadded;
        this.num = parseInt(d);

        if (zeroPadded && this.num > 31) {
            this.type = types.year;
            this.format = '%y';
        } else if (this.num > 12 && this.num <= 31) {
            this.guessYear = true;
            this.guessDay = true;
        } else if (this.num <= 12) {
            this.guessYear = true;
            this.guessMonth = true;
            this.guessDay = true;
        }

    } else if (len >= 3 && len <= 9 && firstLetters.test(d.charAt(0))) {

        if (shortMonths.test(d)) {
            this.format = '%b';
            this.type = types.month;
        } else if (longMonths.test(d)) {
            this.format = '%B';
            this.type = types.month;
        } else if (shortDays.test(d)) {
            this.format = '%a';
            this.type = types.weekday;
        } else if (longDays.test(d)) {
            this.format = '%A';
            this.type = types.weekday;
        } else {
            // could be GMT+0100 or T13:00:00
            console.log('el', d);
        }

    } else if (/^(am|pm)$/.test(d)) {
        this.format = '%p';
        this.type = types.ampm;

    } else if (d.indexOf(':') !== -1) {

        var timeElements = d.split(':');
        var timeStrings = [];
        var ampm = false;

        // it's only possible to have 4 components in a time format
        // ie %H:%M:%S:%L
        if (timeElements.length <= 4) {
            timeStrings = timeParts(timeElements);
        }

        if (timeStrings.length && timeStrings.indexOf(undefined) === -1) {
            this.format = timeStrings.join(':');
            this.type = types.time;
            if (ampm && Number(timeElements[0]) <= 12) {
                this.format.replace('%H', '%I');
            }
        }

    } else if (/^\([a-z]+\)$/.test(d)) {
        console.log('this is part of the time zone info');
    }
};

module.exports = DateParts;

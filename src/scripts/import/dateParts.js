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


function normalise(value) {
    if (!value) return null;

    return value.toString()
        .trim()
        // make all regexp quicker and simpler by removing case
        .toLowerCase()
        // normalise separtators
        .replace(/[\/\ ]/g, '-');
}

function DateParts(value){
    this.parts = [];
    this.tokens = [];
    this.value = normalise(value);
    this.match = this.matched()
}

DateParts.prototype.matched =function(){
    var value = this.value;
    if (!value) return null;

    // resolve quickly for simple year values
    if (/^\d{1,4}$/.test(value)) {
        return '%Y';

        // resolve quickly for strings that
        // look like numbers but definitely not years
        // eg 12345 or 1.1 or 1,000
    } else if (/^[\d\.\,]+$/.test(value)) {
        return null;
    }

    var tokens = value.split(/\-/g);
    this.tokens = tokens;
    var numTokens = tokens.length;

    // resolve quickly with values like 00/00
    if (numTokens === 2 && /^\d{2}-\d{2}$/.test(value)) {
        // assume something like 12-12 means December 2012.
        if (parseInt(tokens[0]) <= 12) {
            return '%m/%y';
        } else {
            // this would mean we have a value like 14-14
            // which we can never safely make a date from.
            return null;
        }
    } else if (numTokens === 2) {
        if (shortMonths.test(tokens[0])) {
            if (/^\d{4}$/.test(tokens[1])) {
                return '%b/%Y';
            } else if (/^\d{2}$/.test(tokens[1])) {
                return '%b/%y';
            }
        } else if (/^\d{4}$/.test(tokens[0]) && shortMonths.test(tokens[1])) {
            return '%Y/%b';
        } else if (/^\d{2}$/.test(tokens[0]) && shortMonths.test(tokens[1])) {
            return '%y/%b';
        }
    }

    // trick the parser into thinking the last
    // token is a year if it matches the pattern 00-00-00
    if (numTokens === 3 && /^\d{2}-\d{2}-\d{2}$/.test(value)) {
        this.tokens[2] = '99';
    }

    var part;
    for (var i = 0; i < numTokens; i++) {
        part = new Part(tokens[i]);
        this.parts.push(part);
    }

    return false;
};

function Part(d) {

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
        var num;
        var timePart;
        var timeStrings = [];
        var ampm = false;

        // it's only possible to have 4 components in a time format
        // ie %H:%M:%S:%L
        if (timeElements.length <= 4) {

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
                    if (timePart.test(/\d{2}\.\d{3}$/)) {
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
}

module.exports = DateParts;

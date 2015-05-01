var DateParts = require('./dateParts.js');

var types = {
    'month':'month',
    'year':'year',
    'day':'day',
    'ampm':'ampm',
    'weekday':'weekday',
    'time':'time'
};
var abbreviatedFormats = {
    '%m/%d/%Y': '%x',
    '%H:%M:%S': '%X'
};

var predictedDateFormat = function (value) {

    var dateParts = new DateParts(value);
    var matched = dateParts.matched();
    if (matched!==false) return matched;

    var parts = dateParts.parts;
    var i= 0;
    var part;

    var hasYear = false;
    var hasMonth = false;
    var hasDay = false;
    var numParts = parts.length;

    for (i = 0; i < numParts; i++) {
        part = parts[i];
        if (part.type === types.year) {
            if (hasYear) {
                return null;
            }
            hasYear = true;
        }
        if (part.type === types.month) {
            if (hasMonth) {
                return null;
            }
            hasMonth = true;
        }
        if (part.type === types.day) {
            if (hasDay) {
                return null;
            }
            hasDay = true;
        }
    }

    var partsWithGuesses = [];

    for (i = 0; i < numParts; i++) {
        part = parts[i];
        if (part.guess()) {
            partsWithGuesses.push(part);
        }
    }

    var numGuesses = partsWithGuesses.length;

    for (i = 0; i < numGuesses; i++) {
        part = partsWithGuesses[i];
        if (hasYear && part.guessYear) {
            part.guessYear = false;
        }
        if (hasMonth && part.guessMonth) {
            part.guessMonth = false;
        }
        if (hasDay && part.guessDay) {
            part.guessDay = false;
        }
    }

    for (i = 0; i < numGuesses; i++) {
        part = partsWithGuesses[i];
        if (!hasDay && part.guessDay && !part.guessMonth && !part.guessYear) {
            part.guessDay = false;
            hasDay = true;
            part.format = part.twoDigit ? '%d' : '%e';
        }
        if (!hasMonth && part.guessMonth && !part.guessDay && !part.guessYear) {
            part.guessMonth = false;
            hasMonth = true;
            part.format = '%m';
        }
        if (!hasYear && part.guessYear && !part.guessDay && !part.guessMonth) {
            part.guessYear = false;
            hasYear = true;
            part.format = '%y';
        }
    }

    for (i = 0; i < numGuesses; i++) {
        part = partsWithGuesses[i];
        if (hasYear && part.guessYear) {
            part.guessYear = false;
        }
        if (hasMonth && part.guessMonth) {
            part.guessMonth = false;
        }
        if (hasDay && part.guessDay) {
            part.guessDay = false;
        }
    }

//// 2


    for (i = 0; i < numGuesses; i++) {
        part = partsWithGuesses[i];
        if (!hasDay && part.guessDay && !part.guessMonth && !part.guessYear) {
            part.guessDay = false;
            hasDay = true;
            part.format = part.twoDigit ? '%d' : '%e';
        }
        if (!hasMonth && part.guessMonth && !part.guessDay && !part.guessYear) {
            part.guessMonth = false;
            hasMonth = true;
            part.format = '%m';
        }
        if (!hasYear && part.guessYear && !part.guessDay && !part.guessMonth) {
            part.guessYear = false;
            hasYear = true;
            part.format = '%y';
        }
    }


    for (i = 0; i < numGuesses; i++) {
        part = partsWithGuesses[i];
        if (hasYear && part.guessYear) {
            part.guessYear = false;
        }
        if (hasMonth && part.guessMonth) {
            part.guessMonth = false;
        }
        if (hasDay && part.guessDay) {
            part.guessDay = false;
        }
    }


//////////////////////////////

    var format = [];

    for (i = 0; i < numParts; i++) {
        part = parts[i];
        if (part.guess()) {
            return null;
        }
        if (part.format) {
            format.push(part.format);
        }
    }

    format = format.length ? format.join('/') : null;

    if (format && format.indexOf('%H') !== -1 && format.indexOf('%p') !== -1) {
        format = format.replace('%H', '%I');
    }

    if (format in abbreviatedFormats) {
        return abbreviatedFormats[format];
    }

    return format;

};

module.exports = predictedDateFormat;

var DateParts = require('./predictDateParts.js');

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

function updatePartGuesses(partsWithGuesses, has){
    var part;
    var numGuesses = partsWithGuesses.length;
    for (var i = 0; i < numGuesses; i++) {
        part = partsWithGuesses[i];
        if (has.year && part.guessYear) {
            part.guessYear = false;
        }
        if (has.month && part.guessMonth) {
            part.guessMonth = false;
        }
        if (has.day && part.guessDay) {
            part.guessDay = false;
        }
    }
}

function hasValidDateParts(parts, partsWithGuesses){
    var has = {
        year: false,
        month: false,
        day: false
    };
    var part;
    var numParts = parts.length;
    for (var i = 0; i < numParts; i++) {
        part = parts[i];
        if (part.type === types.year) {
            if (has.year)  return null;
            has.year = true;
        } else if (part.type === types.month) {
            if (has.month)  return null;
            has.month = true;
        } else if (part.type === types.day) {
            if (has.day) return null;
            has.day = true;
        }
    }
    updatePartGuesses(partsWithGuesses, has);
    return has;
}

function calculatePartFormat(partsWithGuesses, has){
    var part;
    var numGuesses = partsWithGuesses.length;
    for (var i = 0; i < numGuesses; i++) {
        part = partsWithGuesses[i];
        if (!has.day && part.guessDay && !part.guessMonth && !part.guessYear) {
            part.guessDay = false;
            has.day = true;
            part.format = part.twoDigit ? '%d' : '%e';
        }
        if (!has.month && part.guessMonth && !part.guessDay && !part.guessYear) {
            part.guessMonth = false;
            has.month = true;
            part.format = '%m';
        }
        if (!has.year && part.guessYear && !part.guessDay && !part.guessMonth) {
            part.guessYear = false;
            has.year = true;
            part.format = '%y';
        }
    }
    updatePartGuesses(partsWithGuesses, has);
}

var predictedDateFormat = function (value) {

    var dateParts = new DateParts(value);
    var matched = dateParts.matched();
    if (matched!==false) return matched;

    var parts = dateParts.parts;
    var numParts = parts.length;
    var part;
    var format = [];
    var partsWithGuesses =  parts.filter(function(part){ return part.guess(); });
    var has = hasValidDateParts(parts, partsWithGuesses);
    if (!has) return null;

    calculatePartFormat(partsWithGuesses, has); //work out day, month or year if others are not guesses
    calculatePartFormat(partsWithGuesses, has); //2nd pass, in-case previous was updated and we know now the other

    for (var i = 0; i < numParts; i++) {
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

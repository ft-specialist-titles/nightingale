
var predictedDateFormat = require('./predictDateFormat.js');

function gtDateThreshold(count, totalNonDateStrings) {
    return count * 100 / totalNonDateStrings > 95;
}

function convertDateStrings(file, typeInfo){
    var val;
    var dateFormat;
    var countDateFormats = {};
    var totalNonDateStrings = 0;
    typeInfo.dateFormats = [];

    for (var j = 0; j < file.numRows; j++) {
        val = file.data[j][typeInfo.colName];
        if (!val) continue;

        dateFormat = predictedDateFormat(val);
        totalNonDateStrings++;
        if (dateFormat) {
            typeInfo.dateFormats.push(dateFormat);
            if (dateFormat in countDateFormats) {
                countDateFormats[dateFormat]++;
            } else {
                countDateFormats[dateFormat] = 1;
            }
        }
    }
    return {
        valid: countDateFormats,
        total: totalNonDateStrings
    };
}

function popularDate(formatKeys, dateStrings){
    var mostPopularDateFormatCount = null;
    var mostPopularDateFormat = 0;
    var containsLongMonths;
    var containsShortMonths;

    formatKeys.forEach(function (key) {

        var count = dateStrings.valid[key];
        if (count >= mostPopularDateFormatCount) {
            // it's not good enough for the current format to be joint most-popular
            mostPopularDateFormat = (count === mostPopularDateFormatCount) ? null : key;
            mostPopularDateFormatCount = count;
        }

        if (key.indexOf('%B') !== -1) {
            containsLongMonths = key;
        } else if (key.indexOf('%b') !== -1) {
            containsShortMonths = key;
        }

    });

    if (mostPopularDateFormatCount && dateStrings.total) {

        // the most popular date format found is more than 95%
        // of the string values in columns (minus the values that can be parsed by the JS Date constructor)
        var greaterThanThreshold = gtDateThreshold(mostPopularDateFormatCount, dateStrings.total);

        // handle the case when some of the dates are in the month of May
        // we therefore have a mix of long and short month formats ie %B and %b
        // We can gloss over this because either date format will correct parse the date on those strings
        if (!greaterThanThreshold && containsShortMonths && containsLongMonths) {
            if (mostPopularDateFormat === containsLongMonths) {
                mostPopularDateFormatCount += dateStrings.valid[containsShortMonths.replace('%B', '%b')] || 0;
            } else if (mostPopularDateFormat === containsShortMonths) {
                mostPopularDateFormatCount += dateStrings.valid[containsShortMonths.replace('%b', '%B')] || 0;
            }
            // recalculate if the count is over the threshold
            greaterThanThreshold = gtDateThreshold(mostPopularDateFormatCount, dateStrings.total);
        }

        return (greaterThanThreshold) ? greaterThanThreshold : null

    } else {
        return null;
    }
}

function findPopularDateFormat(file, typeInfo){
    var dateStrings = convertDateStrings(file, typeInfo)
    var formatKeys = Object.keys(dateStrings.valid);
    var numKeys = formatKeys.length;

    if (numKeys === 1) {
        typeInfo.mostPopularDateFormat = formatKeys[0];
    } else if (numKeys > 1) {
        typeInfo.mostPopularDateFormat = popularDate(formatKeys, dateStrings)
    }
}

module.exports = findPopularDateFormat;

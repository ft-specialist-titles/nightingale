var d3 = require('d3');
var quarterParser = require('./quarterParser');

module.exports = createTimeTransformer;

function createTimeTransformer(format) {

    var parser = createDateParser(format);
    var today = new Date();
    var year = today.getFullYear();
    var day = today.getDate();
    var month = today.getMonth();
    var timeOnlyFormat = format.indexOf('%H:%M') === 0 || format.indexOf('%I:%M') === 0;

    function transformTime(d) {
        var type = typeof d;

        if (!d) return null;

        if (isValidDate(d)) return d;

        if (type !== 'string') return null;

        var parseValue = parser(d.trim());

        if (isValidDate(parseValue)) {
            if (timeOnlyFormat) {
                parseValue.setDate(day);
                parseValue.setMonth(month);
                parseValue.setFullYear(year);
            }
            return parseValue;
        }

        return null;
    }

    return transformTime;

}

function isValidDate(d) {
    return d && d instanceof Date && !isNaN(+d);
}

function createDate(value) {
    return new Date(value);
}

function useJavascriptDateFn(format) {
    return format === 'ISO' || format === 'JAVASCRIPT';
}

function useQuarterDateFn(format) {
    return format.indexOf('%q') >= 0;
}

var datePartSeparators = /[\-\ ]/g;

function createDateParser(format) {
    if (useJavascriptDateFn(format)) {
        return createDate;
    } else {
        var parser = useQuarterDateFn(format) ? quarterParser(format) : d3.time.format(format).parse;
        return function (value) {
            var normalizedString = value.replace(datePartSeparators, '/');
            return parser(normalizedString);
        };
    }
}

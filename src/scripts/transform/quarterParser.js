var d3 = require('d3');

module.exports = function buildQuarterParser(format) {

    // format is going to be one of
    // %Y/%q
    // %y/%q
    // %q/%Y
    // %q/%y

    var yearParserType;
    var qPosition;
    var d3Format;
    var parts = format.split('/');// format is normalised so '/' will always be the delimiter

    if (parts.length !== 2) {
        throw new Error("the format provided is probably not ok: " + format);
    }

    qPosition = parts.indexOf("%q");
    yearParserType = parts[1-qPosition];
    d3Format = '%d/%m/'+yearParserType;

    return function quarterParser(value) {
        var split = value.split('/');
        var month = split[qPosition].charAt(1) * 3;
        var modifiedDateString = '28/' + month + '/' + split[1-qPosition];
        return d3.time.format(d3Format).parse(modifiedDateString);
    };

};

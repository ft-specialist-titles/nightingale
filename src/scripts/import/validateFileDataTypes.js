var partDateExp = /^(\d{2}am|\d{2}pm|mon|tue|wed|thu|fri|sat|sun|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|q[1234])/i;
var aYearALongWayInTheFuture = 3000;

var isPartDate = function (value) {
    var isLikelyNumber = (/^\d{1,4}$/.test(value) && Number(value) < aYearALongWayInTheFuture);
    if (isLikelyNumber) {
        return true;
    }
    var isPartDate = partDateExp.test(value);
    if (isPartDate) {
        return true;
    }
    return false;
};

var isDateString = function (value) {
    if (!value) return false;
    var result = true;
    var s = value.split(/[\:\/\-\ ]+/);
    var i = s.length;
    if (!s.length || value.length<4) return false; //dont allow 1,02, 103 to be dates
    while (result && i--) {
        result = isPartDate(s[i]);
    }
    return result;
};

var toNumber = function (value) {
    var s = value.trim()
        .replace(/\,(?=\d{2,3})/g, '')
        .replace(/^(\$|£|¥|€)(?=\.?[\de]+\.?\d+)/i, '')
        .replace(/\ *%$/, '');
    var m = s.match(/^\-?[\d\.Ee]+$/);
    return !m || m.length !== 1 ? NaN : Number(m[0]);
};

var sniffDataType = function (value, colNum) {
    // this is set as the context when the forEach invokes .
    var o = this[colNum];
    var isNumber = false;
    var isDate = false;

    if (value === '' || value === undefined || value === null) {
        o.nulls++;
        return;
    }

    value = value.trim();

    if (value === '*') {
        o.nulls++;
        return;
    }

    var parsedNum = toNumber(value);

    if (!isNaN(parsedNum)) {
        isNumber = true;
        o.numbers++;
        o.numberValues.push(value);
    }

    if (isDateString(value)) {
        isDate = true;
        o.dates++;
        o.dateValues.push(value);
    }

    var hasNonNumberChars = value.search(/[^\d\,\.\$\£\¥\€\%\-\ ]/) !== -1;

    if ((!isDate && !isNumber) || (isNumber && hasNonNumberChars)) {
        o.strings++;
        o.stringValues.push(value);
    }
};

module.exports = sniffDataType;

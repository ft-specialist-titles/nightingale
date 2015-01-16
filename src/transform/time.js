var d3 = require('d3');
var datePartSeparators = /[\-\ ]/g;

module.exports = createTimeTransformer;

function createTimeTransformer (format) {

  var parser = createDateParser(format);
  var today = new Date();
  var year = today.getFullYear();
  var day = today.getDate();
  var month = today.getMonth();
  var timeOnlyFormat = format.indexOf('%H:%M') === 0 || format.indexOf('%I:%M');

  function transformTime (d) {
    var type = typeof d;

    if (!d) return null;

    if (isValidDate(d)) return d;

    if (type !== 'string') return null;

    d = d.trim();

    var normalizedString = d.replace(datePartSeparators, '/');
    var parseValue = parser(normalizedString);

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

function createDateParser(format) {
  var useJs = useJavascriptDateFn(format);
  return useJs ? createDate : d3.time.format(format).parse;
}

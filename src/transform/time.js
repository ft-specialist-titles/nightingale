var d3 = require('d3');
var datePartSeparators = /[\-\ ]/g;

module.exports = createTimeTransformer;

function createTimeTransformer (format) {

  var parser = createDateParser(format);

  function transformTime (d) {
    var type = typeof d;

    if (!d) return null;

    if (isValidDate(d)) return d;

    if (type !== 'string') return null;

    d = d.trim();

    var normalizedString = d.replace(datePartSeparators, '/');
    var parseValue = parser(normalizedString);

    if (isValidDate(parseValue)) {
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

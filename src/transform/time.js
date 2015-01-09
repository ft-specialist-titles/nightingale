var d3 = require('d3');
var datePartSeparators = /[\-\ ]/g;

module.exports = createTimeTransformer;

function createTimeTransformer (format) {
  var formatter = d3.time.format(format).parse
  function transformTime (d) {
    var type = typeof d;

    if (!d) return null;

    if (d instanceof Date) return d;

    if (type !== 'string') return null;

    d = d.trim();

    var normalizedString = d.replace(datePartSeparators, '/')
    var parseValue = formatter(normalizedString);

    if (parseValue && parseValue instanceof Date) {
      return parseValue;
    }

    return null;
  }
  return transformTime;
}

var currencySymbol = /^(\$|€|¥|£)/;
var allCommas = /\,/g;
var percent = /(\%)$/;

module.exports = createNumberTransformer;

function createNumberTransformer () {
  function transformNumber(d) {
    var type = typeof d;

    if (type === 'number' && !isNaN(d)) return d;

    if (type !== 'string') return null;

    d = d.trim();

    if (d === '') return null;

    if (d === '*') return null;

    var removedCommonNumberChars = d.replace(allCommas, '')
                                    .replace(currencySymbol, '')
                                    .replace(percent, '')

    var parseValue = Number(removedCommonNumberChars);
    var returnValue = isNaN(parseValue) ? null : parseValue;
    return returnValue;
  }
  return transformNumber;
}

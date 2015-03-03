document.body.innerHTML = __html__['_site/index.html'];

var transformNumber = require('../../../src/scripts/transform/number')();

describe('transformNumber module can ', function () {

    it('sum an array of numbers', function () {

        expect(transformNumber(1)).toBe(1);

    });

});
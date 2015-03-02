document.body.innerHTML = __html__['_site/index.html'];
function appendCSS(fileObj){
    var  link = document.createElement('link'); link.rel = 'stylesheet'; link.href='base/' + fileObj.path;  document.body.appendChild(link)
}
appendCSS({path: '_site/styles/index.min.css'});

var transformNumber = require('../../../src/scripts/transform/number')();

describe('transformNumber module can ', function () {

    it('sum an array of numbers', function () {

        expect(transformNumber(1)).toBe(1);

    });

});
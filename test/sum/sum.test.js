var Maths = require('../../src/sum/index.js');
var test = require('tape');

test('sum', function (t) {
  t.plan(1);
  var maths = new Maths;
  t.equal(maths.sum(1, 1), 2);
});

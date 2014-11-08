var test = require('tape')

var wrp = require('./wrp')

var d = {
  body : 'sample text',
  images : ['a.jpg','b.jpg','c.jpg'],
  bool : true
}

var data = new wrp(d)



test('test data wrapper', function (t) {
  var dx = data._

  t.plan(2)

  t.equal(JSON.stringify(d),JSON.stringify(data._),'wrap')

  var nd = {b:'new'}

  data.update(nd)

  t.equal(JSON.stringify(nd),JSON.stringify(data._),'update')
})


var test = require('tape')


test('Cli should return Stream', function (t) {
  var Stream = require('stream')
  var cli = require('../_cli')()
  t.equal(cli instanceof Stream, true)
  t.end()
})

test('Write wrong input', function (t) {
  t.plan(3)
  var cli = require('../_cli')()
  cli.on('error', function (e) {
    t.equal(e.name, 'Error')
  })
  cli.write({bad:'input'})
  cli.write([1,2,3])
  cli.write('cmd one}two.three=four')
})

test('Write correct input', function (t) {
  var cli = require('../_cli')()
  cli.on('data', function (d) {
    t.deepEqual(d.opts, {a:'one',b:'two'})
    t.end()
  })
  cli.write('cmd a:one,b:two')
})

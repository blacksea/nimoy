var through = require('through2')
var _ = require('underscore')
var test = require('tape')
var cuid = require('cuid')

var cmds = [
  ['+@edit nimoy', cuid()],
  ['+gooshter', cuid()],
  ['+pumicle', cuid()],
  ['+gooshter|pumicle', cuid()],
  ['-gooshter|pumicle', cuid()],
  ['-gooshter', cuid()],
  ['-pumicle', cuid()],
  ['-@edit', cuid()]
]

// update gooshter / pumicle to use dombii / dex / etc!
// actual use cases!

module.exports = function ClientTest (opts) {
  var p = through.obj()

  test('bricoleur api', function (t) { // add omni tests!
    t.plan(cmds.length) 

    cmds.forEach(function (c) {
      s.push(c[0]+':'+c[1])
    })

    p.on('data', function (d) {
      if (typeof d === 'object' && d.key && d.value) {

        var i = (d.key.split(':').length>1) 
          ? dex(d.key.split(':')[1], cmds) 
          : dex(d.key, cmds)

        if (typeof i === 'string') i = Math.abs(i)

        var c = cmds[i]

        if (i !== 0 && i !== 7) t.ok(isCuid(d.value), 'cmd: '+c[0])
        // if (i==7) winodw.location.hash = '@'
        else t.ok(d.value, 'cmd: '+c[0])
      } 
    })
  })

  var s = through.obj(function (d, enc, next) { 
    p.write(d)
    next()
  })

  return s
}

function dex (str, arr) { 
  var res = null
  for (var i=0;i<arr.length;i++) {
    arr[i].forEach(function (item) { if (item === str) res = i })
  }
  return res.toString()
}

// MUTATIONS!

document.body.addEventListener("DOMNodeInserted", function (ev) {
  var el = ev.target
}, false)

document.body.addEventListener("DOMNodeRemoved", function (ev) {
  var el = ev.target
}, false)

// HELPERS!

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') 
    ? true 
    : false

  return r
}

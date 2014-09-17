var through = require('through2')
var test = require('tape')
var cuid = require('cuid')
var _ = require('underscore')

// attach a cuid like a mini cargo in bricoleur

// trace commands as they flow through bricoleur!

var cmds = [ // no objects 
  ['+@edit nimoy', cuid()],
  ['+gooshter', cuid()],
  ['+pumicle', cuid()],
  ['+gooshter|pumicle', cuid()],
  ['-gooshter|pumicle', cuid()],
  ['-gooshter', cuid()],
  ['-pumicle', cuid()],
  ['-@edit', cuid()]
]

module.exports = function ClientTest (opts) {
  var p = through.obj()

  test('bricoleur api', function (t) {
    t.plan(cmds.length) 

    cmds.forEach(function (c) {
      s.push(c[0]+':'+c[1])
    })

    p.on('data', function (d) {
      var i = Math.abs(d[0])
      var res = d[1]
      var c = cmds[i]
      if (i!==0&&i!==7) t.ok(isCuid(res.value), 'cmd: '+c[0])
      else t.ok(res.value, 'cmd: '+c[0])
    })
  })

  var s = through.obj(function (d, enc, next) { 
    if (typeof d === 'object' && d.key && d.value) {
      var i
      if (d.key.split(':').length>1) i = dex(d.key.split(':')[1],cmds)
      else i = dex(d.key,cmds)
      if (i) p.write([i,d])
    }
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

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') 
    ? true 
    : false

  return r
}

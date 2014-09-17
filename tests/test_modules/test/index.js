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
      if (typeof d === 'object' && d.key && d.value) {
        var i = (d.key.split(':').length>1) 
          ? dex(d.key.split(':')[1],cmds) 
          : dex(d.key,cmds)

        if (typeof i === 'string') i = Math.abs(i)

        var c = cmds[i]
        if (i!==0&&i!==7) t.ok(isCuid(d.value), 'cmd: '+c[0])
        else t.ok(d.value, 'cmd: '+c[0])
      } else {
        console.log(JSON.stringify(d))
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

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') 
    ? true 
    : false

  return r
}

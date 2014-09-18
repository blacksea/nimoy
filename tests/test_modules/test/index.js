var through = require('through2')
var sim = require('simulate-dom-event')
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
  ['-pumicle', cuid()]
  // ['-@edit', cuid()]
]

// update gooshter / pumicle to use dombii / dex / etc!
// actual use cases!

module.exports = function ClientTest (opts) {
  var p = through.obj()
  var done = false

  test('bricoleur api', function (t) { // add omni tests!
    t.plan(cmds.length) 

    t.on('end', function () {
      done = true
      test('gui: user login', uiTest)
    })

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
        else t.ok(d.value, 'cmd: '+c[0])
      } 
    })
  })

  var s = through.obj(function (d, enc, next) { 
    if (!done) p.write(d)
    next()
  })

  return s
}

function uiTest (t) {
  t.plan(3)

  document.body.addEventListener("DOMNodeInserted", function (e) {
    var target = e.target.children[0]
    if (target.className==='login') {
      t.ok(target, 'login drawn')
      target.querySelector('#login').value = 'nimoy'
      var inp = target.querySelector('#login')
      inp.value = 'nimoy'
      process.nextTick(function () {
        window.simulateEvent(target,'submit')
      })
    } else if (target.className === 'omni') {
      t.ok(target, 'omni drawn')
    }
  }, false)

  document.body.addEventListener("DOMNodeRemoved", function (e) {
    var target = e.target.children[0]
    t.equal(target.className,'login','login erased')
  }, false)

  // login!
  window.location.hash = '@'
}

// helpers

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') 
    ? true 
    : false

  return r
}

function dex (str, arr) { 
  var res = null
  for (var i=0;i<arr.length;i++) {
    arr[i].forEach(function (item) { if (item === str) res = i })
  }
  return res.toString()
}

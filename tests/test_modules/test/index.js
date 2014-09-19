var through = require('through2')
var sim = require('simulate')
var _ = require('underscore')
var test = require('tape')
var cuid = require('cuid')

sim.contextMenu = function (el) { // contextmenu monkeypatch
  var e = document.createEvent('MouseEvents')
  e.initMouseEvent(
    'contextmenu',true,true,window,1,0,0,0,0,false,false,false,false,1,null
  )
  el.dispatchEvent(e)
}

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

module.exports = function ClientTest (opts) {
  var p = through.obj()
  var s = through.obj(function (d,enc,next) { if (!done) p.write(d); next()})
  var done = false

  function getIndex (str, arr) { 
    var res = null
    for (var i=0;i<arr.length;i++) {
      arr[i].forEach(function (item) { if (item === str) res = i })
    }
    return res.toString()
  }

  test('bricoleur api', function (t) { 
    t.plan(cmds.length) 

    cmds.forEach(function (c) { s.push(c[0]+':'+c[1]) })

    p.on('data', function (d) {
      if (typeof d === 'object' && d.key && d.value) {
        var i = (d.key.split(':').length>1) 
          ? getIndex(d.key.split(':')[1], cmds) 
          : getIndex(d.key, cmds)

        if (typeof i === 'string') i = Math.abs(i)
        var c = cmds[i]
        t.ok(d.value, 'do '+c[0])
      } 
    })

    t.on('end', function () {
      done = true
      test('gui interactions', interfaceTest)
    })
  })

  return s
}

function interfaceTest (t) {
  t.plan(3)

  // test dombii! && possibly drompii!

  var pumicle = ['?','p','u','m','i','c','l','e']

  function typeIt (arr, el) {
    arr.forEach(function (k) { el.value += k; sim.keyup(el,k) })
  }

  function domNodeAdd (e) {
    var target = e.target

    if (target.className==='login') {
      // simulate bad logins as well!

      t.ok(target, 'login drawn')
      target.querySelector('#login').value = 'nimoy'
      process.nextTick(function () { sim.submit(target) })

    } else if (target.children[0].className==='omni') {
      var input = target.querySelector('input')
      // process.nextTick(function () { 
        // typeIt(pumicle, input) 
        // sim.contextMenu(document.body.querySelector('.mool'))
      // })
      t.ok(target, 'omni drawn')
    }
  }

  function domNodeRm (e) {
    var target = e.target
    if (target.className==='login') t.ok(target,'login erased')
  }

  window.location.hash = '@' // trigger login

  document.body.addEventListener("DOMNodeInserted", domNodeAdd, false)
  document.body.addEventListener("DOMNodeRemoved", domNodeRm, false)
}

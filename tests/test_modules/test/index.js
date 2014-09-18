var through = require('through2')
var sim = require('simulate')
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

module.exports = function ClientTest (opts) {
  var p = through.obj()
  var done = false

  // run sep dombii / drompii tests!

  test('bricoleur api', function (t) { 
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
        if (i !== 0 && i !== 7) t.ok(isCuid(d.value), 'do '+c[0])
        else t.ok(d.value, 'do '+c[0])
      } 
    })

    t.on('end', function () {
      done = true
      test('gui interactions', uiTest)
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

  // keyed commands
  
  var pumicle = [
    ['?',63],
    ['p',112],
    ['u',117],
    ['m',109],
    ['i',105],
    ['c',99],
    ['l',108],
    ['e',101]
  ]

  var gooshter = ['?','p','u','m','i','c','l','e']

  function keySim (arr, el) {
    arr.forEach(function (k) { el.value += k; sim.keyup(el,k) })
  }

  document.body.addEventListener("DOMNodeInserted", function (e) {
    var target = e.target.children[0]

    if (target.className==='login') {

      t.ok(target, 'login drawn')
      target.querySelector('#login').value = 'nimoy'
      process.nextTick(function () { sim.submit(target) })

    } else if (target.className==='omni') {

      var input = target.querySelector('input')

      process.nextTick(function () { 
        // keySim(pumicle, input) 
        keySim(gooshter, input) 
      })

      t.ok(target, 'omni drawn')

    }
  }, false)

  document.body.addEventListener("DOMNodeRemoved", function (e) {
    var target = e.target.children[0]
    t.equal(target.className,'login','login erased')
  }, false)

  window.location.hash = '@' // trigger login
}

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

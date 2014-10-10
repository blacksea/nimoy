var through = require('through2')
var sim = require('simulate')
var _ = require('underscore')
var test = require('tape')
var cuid = require('cuid')
var emitter = require('events').EventEmitter


// contextmenu monkeypatch //////////////////////////////////////////////////
sim.contextMenu = function (el) { 
  var e = document.createEvent('MouseEvents')
  e.initMouseEvent(
    'contextmenu',true,true,window,1,0,0,0,0,false,false,false,false,1,null)
  el.dispatchEvent(e)
} ///////////////////////////////////////////////////////////////////////////


// BRICOLEUR API tests


var cmds = {}

cmds[cuid()] = ['+@edit nimoy', function(t,d)
  {t.ok(d.value, 'login : +@edit') }]

cmds[cuid()] = ['+gooshter', function (t,d)
  {t.ok(d.value, 'add module : +gooshter')}]

cmds[cuid()] = ['+pumicle', function (t,d) 
  {t.ok(d.value, 'add module : +pumicle')}]

cmds[cuid()] = ['+gooshter|pumicle', function (t,d) 
  {t.ok(d.value,'pipe modules : +gooshter|pumicle')}]

cmds[cuid()] = ['+#cvs', function (t,d)
  {t.ok(d.value, 'save canvas : +#canvas')}]
 
cmds[cuid()] = ['!#cvs', function (t,d)
  {t.ok(d.value, 'load canvas : !#canvas')}]

cmds[cuid()] = ['-gooshter', function (t,d)
  {t.ok(d.value, 'rm module : -gooshter')}]

cmds[cuid()] = ['-pumicle', function (t,d) 
  {t.ok(d.value, 'rm pumicle : -pumicle')}]

cmds[cuid()] = ['-@edit', function (t,d) 
  {t.ok(d.value, 'logout : -@edit')}]


module.exports = function BrowserTest (opts) {
  var done = false

  var updates = new emitter()

  var s = through.obj(function (c,e,n) {updates.emit('res', c);n()})

  test('bricoleur api', function (t) { 
    t.plan(_.keys(cmds).length) 

    for (c in cmds) s.push(cmds[c][0]+':'+c)

    updates.on('res', function (d) { // handle errors!
      if (d instanceof Error) {} // fail!
      if (!d.key || done) { return null }
      var k = (d.key.split(':').length > 1) ? d.key.split(':')[1] : d.key
      cmds[k][1](t,d)
    })

    t.on('end', function () { done = true; test('gui interactions', domTest) })
  })

  return s
}


// UI / DOM tests!

function domTest (t) {
  t.plan(3)

  var pumicle = ['?','p','u','m','i','c','l','e']

  function typeIt (arr, el) {
    arr.forEach(function (k) { el.value += k; sim.keyup(el,k) })
  }

  function domNodeAdd (e) {
    var target = e.target

    if (target.className==='login') { 

      t.ok(target, 'login drawn')
      target.querySelector('#login').value = 'nimoy'
      process.nextTick(function () { sim.submit(target) })

    } else if (target.children[0].className==='omni') {

      var input = target.querySelector('input')
      process.nextTick(function () { 
        // typeIt(pumicle, input)
        // sim.submit(input)
        // sim.contextMenu(document.body.querySelectorAll('.mool')[2])
      })
      t.ok(target, 'omni drawn')

    }
  }

  function domNodeRm (e) {
    var target = e.target
    if (target.className === 'login') t.ok(target,'login erased')
  }

  window.location.hash = '@' 
  document.body.addEventListener("DOMNodeInserted", domNodeAdd, false)
  document.body.addEventListener("DOMNodeRemoved", domNodeRm, false)
}

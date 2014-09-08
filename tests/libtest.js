var cuid = require('cuid')
var dex = require('../lib/dex.js')
var omni = require('../lib/omni.js')({id:cuid()})
var dombii = require('../lib/dombii')
var test = require('tape')

var fs = require('fs')
var proj = fs.readFileSync(__dirname+'/test.hogan','utf8')

var pdata = {
  title : "untitled project",
  name : "untitled",
  category : "",
  images : [
    {i:1,src:"http://placehold.it/157x120",info:"unknown"},
    {i:2,src:"http://placehold.it/157x120",info:""},
    {i:3,src:"http://placehold.it/157x120",info:""},
    {i:4,src:"http://placehold.it/157x120",info:""},
    {i:5,src:"http://placehold.it/157x120",info:""}
  ]
}

var click = document.createEvent("MouseEvents")
click.initMouseEvent('contextmenu', true, true, window, 1, 0, 0, 0, 0, false,
false, false, false, 2, null)


test('DAX', function (t) {
  omni.on('data', function (d) {
    console.log(d)
  })

  var html = dombii({template:proj,parent:document.body,id:cuid()})
  html.draw(pdata)

  var index = dex({template:proj,data:pdata})

  function climbToCuid (target) {
    var element = target
    var depth = 0
    while (element) {
      if (element.previousSibling) {
        element = element.previousSibling; depth++
      } else if (element.parentElement) {
        element = element.parentElement; depth++
      }
      if (element.id && isCuid(element.id)) {
        return depth 
      }
    }
  }

  var targ = document.body.querySelectorAll('li')[2]

  var d = climbToCuid(targ)

  // simulate a context click action!
  // where to store the indexed templates!

  for (k in index[d]) {
    if (typeof index[d][k] === 'object') {
      for (i in index[d][k]) {
        var q = index[d][k][i] 
      }
    }
  }

  t.ok(html.index[d], 'indexed item exists')
  targ.dispatchEvent(click)
  t.end()
})

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') 
    ? true 
    : false

  return r
}

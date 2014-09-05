var cuid = require('cuid')
var dax = require('./dex.js')
var dombii = require('dombi')
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

test('DAX', function (t) {
  var html = dombii({template:proj,parent:document.body,id:cuid()})

  html.draw(pdata)

  var h = document.body.querySelector('.project').outerHTML
  var target = document.body.querySelectorAll('li')[2]

  t.end()
})

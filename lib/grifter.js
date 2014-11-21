var _ = require('underscore')
var D = require('./dombii.js')
var drompii = require('./drompii.js')
var through = require('through2')


var GRIFTER = require('fs').readFileSync(__dirname+'/grifter.hogan', 'utf8')


module.exports = function Grifter () {
  var s = through.obj(function (d,e,n) { grifter(d);n() })  

  var editor = new D({
    template : GRIFTER,
    parent : document.body,
    drag : true,
    events : [
      ['.grifter textarea', 'keyup', editOUT],
      ['.grifter textarea', 'keydown', editIN]
    ]
  })
  
  function grifter (e) {
    cancel(e)

    // erase if (e.shiftKey) delete module
  
    editor.erase()

    // add a delete option

    if (e.target.parentElement && e.target.parentElement.className === 'lib') { 
      return false
    } else if (e.target.tagName === 'HTML') {

    }
    
    blob = drompii(e) 
    if (!blob) return false

    if (e.ctrlKey) {
      cancel(e)
      s.push('-'+blob.cuid)
      return false
    }

    console.log(blob)

    var d ={x:e.clientX+window.pageXOffset,y:(e.clientY-20)+window.pageYOffset}
    d.props = []

    _.each(blob.edit.value,function (v,k) {
      var prop = {key:k,value:v}
      d.props.push(prop)
    })

    editor.draw(d)
  }

  function save () {
    // s.push({key:'+$'+blob.id,value:blob.data})
    editor.erase()
  }

  function editIN (e) {
    if (e.keyCode === 13) cancel(e)
  }

  function editOUT (e) { // some intelligent feedback / filtering
    if (e.keyCode === 13) {
      e.preventDefault()
      save()
    }
    var body = e.target.value.replace(/[\n\r]/g,'')
    blob.data[_.keys(blob.edit)[0]] = body
    return false
  }


  return s 
}

function cancel (e) { 
  if (e.stopPropagation) e.stopPropagation();
  e.preventDefault() 
}

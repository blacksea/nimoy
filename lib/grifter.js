var _ = require('underscore')
var D = require('./dombii.js')
var drompii = require('./drompii.js')
var through = require('through2')
var upload = require('./upload.js')


var GRIFTER = require('fs').readFileSync(__dirname+'/grifter.hogan', 'utf8')


module.exports = function Grifter () {
  var s = through.obj(function (e) { console.log(e) })  

  var editor = new D({
    template : GRIFTER,
    parent : document.body,
    drag : true,
    events : [
      ['.grifter textarea', 'keyup', editOUT],
      ['.grifter textarea', 'keydown', editIN],
      ['.grifter textarea', 'dragenter', cancel],
      ['.grifter textarea', 'dragleave', cancel]
    ]
  })
  
  function grifter (e) {
    cancel(e)

    if (e.target.parentElement && e.target.parentElement.className === 'lib') { 

      return false
    } else if (e.target.tagName === 'HTML') {

    }
    
    blob = drompii(e) 

    // process the blob and then do the draw!
    var d = {x:e.clientX,y:e.clientY-20}
    d.props = []

    _.each(blob.edit.value,function (v,k) {
      var prop = {key:k,value:v}
      d.props.push(prop)
    })


    editor.draw(d)
  }

  function save () {
    console.log(blob.data)
    // s.push({key:'+$'+blob.id,value:blob.data})
    editor.erase()
  }

  function editIN (e) {
    if (e.keyCode === 13) cancel(e)
  }

  function editOUT (e) { // some intelligent feedback / filtering
    if (e.keyCode === 13) { 
      e.preventDefault()
      console.log(e.target.value)
      save()
    }
    var body = e.target.value.replace(/[\n\r]/g,'')
    blob.data[_.keys(blob.edit)[0]] = body
    return false
  }

  window.addEventListener('contextmenu',grifter,false)

  return s 
}

function cancel (e) { e.preventDefault() }

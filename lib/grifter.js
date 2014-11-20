var _ = require('underscore')
var D = require('./dombii.js')
var drompii = require('./drompii.js')
var through = require('through2')

var GRIFTER = require('fs').readFileSync(__dirname+'/grifter.hogan', 'utf8')

// what data does this need ? how should it interface?

module.exports = function Grifter () {
  var s = through.obj(function (e) { console.log(e) })  

  var editor = new D({
    template : GRIFTER,
    parent : document.body,
    events : [
      ['.grifter', 'keyup', edit],
      ['.grifter', 'dragenter', cancel],
      ['.grifter', 'dragleave', cancel],
      ['.grifter', 'dragover', cancel]
    ]
  })

  var grift = D({
    template : GRIFTER,
    parent : document.body,
    events : [
      ['.grifter', 'keyup', edit]
    ]
  })
  
  function grifter (e) {
    e.preventDefault()

    if (e.target.parentElement && e.target.parentElement.className === 'lib') { 
      console.log('add page template from current canvas')
      return false
    } else if (e.target.tagName === 'HTML') {
      console.log('edit settings')
    }

    // need to see the target and adjust parameters accordingly!
    // s.push(e)
    
    // how to expose blob?
    blob = drompii(e) 

    console.log(blob)
  }

  function edit (e) { 
    if (e.keyCode === 13) {
      e.preventDefault()
      var body = e.target.value.replace(/[\n\r]/g,'')
      blob.data[_.keys(blob.edit)[0]] = body
      s.push({key:'+$'+blob.id,value:blob.data})
      editor.erase()
      return false
    }
  }

  window.addEventListener('contextmenu',grifter,false)

  return s 
}

function cancel(e){;e.preventDefault()}

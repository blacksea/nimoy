var GRIFTER = fs.readFileSync(__dirname+'/grifter.hogan', 'utf8')
var _ = require('underscore')
var D = require('./dombii.js')
var through = require('through2')
var drompii = require('./drompii.js')


module.exports = function Grifter () {
  var s = through.obj()

  var grift = D({
    template : GRIFTER,
    parent : document.body,
    events : [
      ['.grifter','keyup',edit]
    ]
  })
  
  function grifter (e) {
    e.preventDefault()
    blob = drompii(e)
    console.log(JSON.stringify(blob))
    grift.draw({x:0,y:0,body:_.values(blob.edit)[0]})
  }

  function edit (e) { 
    if (e.keyCode === 13) 
      s.push({key:'+$'+blob.id,value:blob.data})
  }

  window.addEventListener('contextmenu',grifter,false)

  return s 
}

function dax (value, data) { // merge blob dax with d!!!

}

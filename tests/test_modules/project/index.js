var through = require('through2')
var D = require('../../../lib/dombii.js')
var url = require('url')

module.exports = function ($) {
  var t, selected, main
  var id = $.meta
  var s = through.obj()

  $.on('data', function (d) { 
    if (d.nimoy) {
      d.events = [['.thumbs a','click', bigify]]
      t = new D(d)
      d.data.main = d.data.slides[0].src
      d.data.descript = d.data.slides[0].txt
      t.draw(d.data,init)
    } else {
      d.main = 'url("'+d.slides[0].src+'")'
      d.descript = d.slides[0].txt
      t.draw(d)
    }
  })

  $.on('close', function () { t.erase() })

  function init () {main = document.getElementById(id).querySelector('.main')}

  function bigify (e) {
    selected = e.target
    var sBG = selected.style.backgroundImage.replace(/url\(|\)/g,'')
    t.data.main = url.parse(sBG).pathname.replace(/\%22/g,'')
    t.data.descript = selected.title
    t.draw(t.data)
  }

  return {s:s, $:$}
}

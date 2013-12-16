// UI ELEMENTS with PAPERJS

var through = require('through')
var cvs

window.addEventListener('resize', sizeCanvas, false)

function sizeCanvas (e) {
  cvs.height = window.innerHeight
  cvs.width = window.innerWidth
}

function fade (mode, item, cb) {
  var i = 0
  paper.view.onFrame = function (e) {
    var dec = i*0.06
    if (dec <= 1) {
      if (mode == 'out') item.opacity = 1-dec
      if (mode == 'in') item.opacity = dec
      paper.view.draw()
    } 
    if (i == 16) cb()
    i++
  }
}

// SETUP BODY
var body = document.body
body.style.margin = 0
body.style.padding = 0

// INSTALL CANVAS & MAKE IT FULLSCREEN WITH AUTO RESIZE
var cvs = document.createElement('canvas')
cvs.setAttribute('resize','')
cvs.style.backgroundColor = '#f1f1f1'
cvs.width = winWidth
cvs.height = winHeight
body.appendChild(cvs)

// INSTALL PAPER
var paperJS = document.createElement('script')
paperJS.setAttribute('src','/paper-core.min.js')
body.appendChild(paperJS)
paperJS.addEventListener('load',,false)

function init () {

}

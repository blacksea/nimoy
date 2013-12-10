// UI ELEMENTS with PAPERJS

var through = require('through')

var winHeight = document.body.clientHeight
var winWidth = document.body.clientWidth
var winCenterX = winWidth / 2
var winCenterY = winHeight / 2

window.onresize = function () {
  winHeight = document.body.clientHeight
  winWidth = document.body.clientWidth
  winCenterX = winWidth / 2
  winCenterY = winHeight / 2
  cvs.width = winWidth
  cvs.height = winHeight
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
paperJS.addEventListener('load',init,false)

function init () {

}

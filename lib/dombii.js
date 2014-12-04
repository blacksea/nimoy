var _ = require('underscore')
var t = require('templayed') 
var patcher = require('html-patcher')

module.exports = function (opts) { 
  if (!opts.template) return false
  var parent = document.body
  var patch 
  var self = this
  self.id = opts.id
  self.name = opts.name
  self.template = opts.template
  var className = opts.name
  if (opts.freshness) self.freshness = opts.freshness

  var wrapper = (className) ? className : 'div'

  function render (d) {
    var html = t(self.template)(d) 
    if (self.id) return '<'+wrapper+' id="'+self.id+'">'+html+'</'+wrapper+'>'
    return html
  }

  function bind (bool) {
    var b = (bool) ? 'addEventListener' : 'removeEventListener' 

    opts.events.forEach(function (e) {
      var selector = (typeof e[0] === 'string')
        ? parent.querySelectorAll(e[0])
        : e[0] 

      if (selector instanceof NodeList) {
        _.each(selector, function (el) {
          el[b](e[1],e[2],false)
        })
      } else {
        selector[b](e[1],e[2],false)
      }
    })
  }

  function draggable () {  // look for bounds and bounce out
    if (className==='') return false

    var el = (self.id) 
      ? document.getElementById(self.id).querySelector('.'+className)
      : document.querySelector('.'+className)

    el.style.cursor = 'grab'
    el.style.cursor = '-webkit-grab'

    el.addEventListener('mousedown', function down (e) {
      if (e.target === el) {
        var top = e.pageY - e.target.offsetTop
        var left = e.pageX - e.target.offsetLeft
        document.onmousemove = function (ev) { 
          self.data.y = ev.pageY-top
          self.data.x = ev.pageX-left
          self.draw(self.data)
          ev.preventDefault()
        }
        e.preventDefault()
      }
    },false)

    document.addEventListener('mouseup', function up (e) {
      if (e.target === el) document.onmousemove = null
    })
  }


  function captureData (d) {
    self.data = d
    if (self.id) { // maybe do not save all of this!
      var data = {
        template : self.template,
        name : self.name,
        data : d
      }
      if (self.freshness) data.freshness = self.freshness
      localStorage[self.id] = JSON.stringify(data)
    }
  }


  this.draw = function (data,cb) { // also allow small incremental updates
    if (data) captureData(data)
    if (data && data.freshness) return false
    if (!data && self.data) data = self.data
    if (!patch) { // attach a general callback for once dom is rendered
      patch = patcher(document.body, render(data), function (e,p) {
        if (e && cb) cb(e)
        if (!e) { 
          if (opts.events) bind(true); 
          if (cb) cb() 
          if (opts.drag) draggable()
        }
      })
    } else { if (cb) patch(render(data),cb); else patch(render(data)) }
  } 


  this.erase = function (cb) {
    if (!patch) return false
    if (opts.events) bind(false)
    patch('<!-- -->') // clear!?
    patch = null
    if (cb) cb()
  }
}

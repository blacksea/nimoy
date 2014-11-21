var _ = require('underscore')
var t = require('templayed') 
var patcher = require('html-patcher')


module.exports = function (opts) { // build opts are good!

  if (!opts.template) return null
  if (!opts.parent) opts.parent = document.body

  // if (opts.id) localStorage[opts.id] = JSON.stringify({template:opts.template})
  // how is data init?

  var self = this
  var patch 
  var div = document.createElement('div')
  div.innerHTML = opts.template
  var className = div.children[0].className

  var wrapper = (opts.name) ? opts.name : 'div'

  function render (d) {
    var html = (!d) ? opts.template : t(opts.template)(d) 
    if (opts.id) return '<'+wrapper+' id="'+opts.id+'">'+html+'</'+wrapper+'>'
    return html
  }

  function bind (bool) {
    var b = (bool) ? 'addEventListener' : 'removeEventListener' 

    opts.events.forEach(function (e) {
      var selector = (typeof e[0] === 'string') 
        ? opts.parent.querySelectorAll(e[0])
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

    var el = (opts.id) 
      ? document.getElementById(opts.id).querySelector('.'+className)
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
    if (opts.id)  // all is in offline mode for now!
      localStorage[opts.id] = JSON.stringify({template:opts.template,data:d})
  }

  this.draw = function (data,cb) {// also allow small incremental updates
    if (data) captureData(data)
    if (!data && self.data) data = self.data
    if (!patch) { // attach a general callback for once dom is rendered
      patch = patcher(opts.parent, render(data), function (e,p) {
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

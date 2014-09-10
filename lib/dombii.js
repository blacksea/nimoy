var t = require('templayed') 
var dex = require('./dex.js')

module.exports = function (opts) { 
  var domNode = document.createElement('div')

  if (!opts.template || !opts.parent) return null

  domNode.innerHTML = opts.template

  var nodule

  var dombii = {
    live : false,
    getstr : function (selector) {
      if (!selector) return opts.template
      return domNode.querySelector(selector).parentElement.innerHTML
    },
    get : function (selector) {
      if (!selector) return nodule

      var res = (selector[0] === '.' || selector[0] === '#') 
        ? nodule.querySelector(selector)
        : nodule.getElementsByTagName(selector)[0]

      return res
    },
    draw : function (data, part) {
      var div = document.createElement('div')

      div.innerHTML = (!data) 
        ? opts.template 
        : (!part) 
        ? t(opts.template)(data) 
        : t(dombii.get(part).innerHTML)(data)

      if (nodule) {
        if (opts.id) nodule.id = opts.id
        events('rm')
        opts.parent.replaceChild(div, nodule)
        nodule = div
        events('add')
      } else if (!nodule) {
        nodule = div
        if (opts.id) nodule.id = opts.id
        opts.parent.appendChild(nodule)
        events('add')
      }
   
      var index = dex({template:opts.template,data:data})
      if (opts.id && index) localStorage[opts.id] = JSON.stringify(index)
      if (index) dombii.index = index

      dombii.live = true

      return dombii
    },
    erase : function (part) {
      events('rm')
      opts.parent.removeChild(nodule)
      dombii.live = false
    }
  }

  function events (action) {
    if (!opts.events) return false
    opts.events.forEach(function (event) {
      var el = dombii.get(event[0])
      if (action==='add') {
        el.addEventListener(event[1], event[2], false)
      } else if (action==='rm') {
        el.removeEventListener(event[1], event[2], false)
      }
    })
  }
    
  // hook / expose to canvas! or bricoleur! 
  return dombii
}

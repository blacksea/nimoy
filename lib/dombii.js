var t = require('templayed') 
var dex = require('./dex.js')

module.exports = function (opts) { 
  var domNode = document.createElement('div')

  if (!opts.template || !opts.parent) return null

  domNode.innerHTML = opts.template
  var nodule

  var dombii = {
    getstr : function (selector) {
      if (!selector) return opts.template
      return domNode.querySelector(selector).parentElement.innerHTML
    },
    get : function (selector) {
      var res = (selector[0] === '.' || selector[0] === '#') 
        ? domNode.querySelector(selector)
        : domNode.getElementsByTagName(selector)[0]

      if (!selector) return domNode
      else return domNode.querySelector(selector)
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
        opts.parent.replaceChild(div, nodule)
        nodule = div
      } else if (!nodule) {
        nodule = div
        if (opts.id) nodule.id = opts.id
        opts.parent.appendChild(nodule)
      }

      // use localStorage to hold index for now but replace later!
      var index = dex({template:opts.template,data:data})
      if (opts.id && index) localStorage[opts.id] = JSON.stringify(index)
      if (index) dombii.index = index

      return dombii
    },
    erase : function (part) {
      opts.parent.removeChild(nodule)
    }
  }
  // hook / expose to canvas! or bricoleur! 
  return dombii
}

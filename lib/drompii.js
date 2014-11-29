var dex = require('./dex.js')
var _ = require('underscore')

module.exports = function dromppi (e) {
  var target = climbToCuid(e.target)

  if (target) {
    var modl = JSON.parse(localStorage[target.top.id])

    var index = dex(modl)
    var res = null

    _.each(dex(modl), function (v,k) {
      var pos = k.split(':')
      if (Math.abs(pos[0]) === target.depth) {
        res = {
          name: target.top.tagName.toLowerCase(),
          data: modl.data,
          type: e.target.tagName,
          cuid: target.top.id
        }
        res.edit = index[k]
      }
    })
    
    return res

  } else return null
}

function climbToCuid (target) { 
  var element = target
  var depth = 0 

  while (element) {
    if (element.id && isCuid(element.id)) {
      if (element.contains(target)) return {depth: depth, top: element} 
      else return null
    }
    if (element.previousElementSibling) { 
      depth++
      element = element.previousElementSibling
      if (element.children) depth = zoom(element, depth)
    } else if (element.parentElement && !element.previousElementSibling) {
      depth++ 
      element = element.parentElement;
    } else if (!element.parentElement && !element.previousElementSibling) {
      return false
    } else return false
  }
}

function zoom (el,count) {
  count += el.children.length
  _.each(el.children, function (c) {
    if (c.children) count = zoom(c, count)
  })
  return count
}

function isCuid (id) { 
  var r = (typeof id === 'string' && id.length === 25 && id[0] === 'c') 
    ? true : false

  return r
}

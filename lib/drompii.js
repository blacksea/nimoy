// do the dex now and not when drawing! 
// -- need data + template ( store them in a leveldb lib key? )

var dex = require('./dex.js')
var _ = require('underscore')

module.exports = function dromppi (e) {
  var target = climbToCuid(e.target)
  if (target) {
    var modl = JSON.parse(localStorage[target.top.id])

    var index = dex(modl)

    console.log(target.depth)

    for (i in index) {
      if (Math.abs(i[0]) === target.depth) { // this is bugged as shit
        if (i.length>1) var res = [i[2],index[i]]
        else res = index[i]

        return {
          edit: res,
          data: modl.data,
          type: e.target.tagName,
          id: target.top.id
        }
      }
    }
    return null
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

// move horizontal and vertical

function isCuid (id) { 
  var r = (typeof id === 'string' && id.length === 25 && id[0] === 'c') 
    ? true : false

  return r
}

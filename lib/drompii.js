// do the dex now and not when drawing! 
// -- need data + template ( store them in a leveldb lib key? )

var dex = require('./dex.js')

module.exports = function dromppi (e) {
  var target = climbToCuid(e.target)
  if (target) {

    var modl = JSON.parse(localStorage[target.top.id])
    var index = dex(modl)

    // cache pieces OF state // sharding!?

    var index = JSON.parse(localStorage[target.top.id])

    for (i in index) {
      if (Math.abs(i[0]) === target.depth) {
        if (i.length>1) var res = [i[2],index[i]]
        else res = index[i]
        return {id:target.top.id, index:index, prop: res}
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
      if (element.contains(target)) return {depth:depth,top:element} 
      else return null
    }
    if (element.previousSibling) { 
      if (element.previousSibling.tagName !== undefined) depth++
      element = element.previousSibling
    } else if (element.parentElement) {
      element = element.parentElement; depth++
    } else if (!element.parentElement && !element.previousSibling) {
      return false
    } else return false
  }
}

function isCuid (id) { // find a nicer way!
  var r = (typeof id === 'string' && id.length === 25 && id[0] === 'c') 
    ? true : false

  return r
}

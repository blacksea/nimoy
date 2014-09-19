module.exports = function dromppi (e) {
  var target = climbToCuid(e.target)

  var dex = (target)
    ? JSON.parse(localStorage[target.top.id])[target.depth] 
    : null

  return dex
}

function climbToCuid (target) { // fix this!
  var element = target
  var depth = 1 
  while (element) {
    if (element.id && isCuid(element.id)) {
      if (element.contains(target)) return {depth:depth,top:element} 
      else return null
    }
    if (element.previousSibling) { 
      if (element.previousSibling.tagName !== undefined) depth++
      element = element.previousSibling;
    } else if (element.parentElement) {
      element = element.parentElement; depth++
    } else if (!element.parentElement && !element.previousSibling) {
      return false
    } else return false
  }
}

function isCuid (id) {// this is not good!
  var r = (typeof id==='string'&&id.length===25&&id[0]==='c') ? true : false
  return r
}

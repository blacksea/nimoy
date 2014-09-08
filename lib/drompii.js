module.exports = function dromppi (e) {
  var target = climbToCuid(e.target)
  var parcel = JSON.parse(localStorage[target.top.id])
  return parcel[target.depth]
}

function climbToCuid (target) {
  var element = target
  var depth = 0
  while (element) {
    if (element.id && isCuid(element.id)) {
      return {depth:depth,top:element} 
    }
    if (element.previousSibling) {
      element = element.previousSibling; depth++
    } else if (element.parentElement) {
      element = element.parentElement; depth++
    } else if (!element.parentElement && !element.previousSibling) {
      return false
    }
  }
}

function isCuid (id) {
  var r = (typeof id === 'string' && id.length === 25 && id[0] === 'c') 
    ? true 
    : false

  return r
}

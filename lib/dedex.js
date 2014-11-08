var _ = require('underscore')

module.exports = function (d, dax) { // merge blob dax with d!!!
  if (!dax || !d) return false
  var k,i,v
  if (dax instanceof Array) {
    k = _.keys(dax[1])[0]
    i = dax[0]
    v = dax[1][k]
    if (!d[k]) return false
    d[k][i] = v
    return d
  } else {
    k = _.keys(dax)[0]
    v = dax[k]
    if (!d[k]) return false
    d[k] = v
    return d
  } 
  return false
}

var parser = require('htmlparser2/lib/Parser')
var _ = require('underscore')


var Dex = function (d) {
  var self = this
  var c_depth = 0
  var child = false
  var offset = 0
  var parent = null
  var hash = {}

  this.depth = 0
  this.hash = function () { return hash }
  this.add = function (str) {
    str = str.replace(/\{|\}/g,'')
    if (str[0] === '#') { 
      child = true
      offset = self.depth
      parent = str.slice(1)
    } else if (str[0] === '/') { 
      if (d[parent]) for (var i=0;i<d[parent].length;i++) {
        if (i>0) self.depth += c_depth
        var key = self.depth+':'+i
        var val = d[parent][i]
        if (!hash[key]) hash[key] = {}
        hash[key].key = parent
        hash[key].value = d[parent][i]
        hash[key].index = i
      }
      child = false
      parent = null
    } else {
      if (child && parent) {
        c_depth = (self.depth-offset)
      }
      if (!child) {
        if (!hash[self.depth]) hash[self.depth] = {value:{}}
        hash[self.depth]['value'][str] = d[str]
      }
    }
  }
}


module.exports = function dax (opts) {
  if (!opts.data || !opts.template) return null

  var dex = new Dex(opts.data)
  var mindom = document.createElement('div')
  mindom.innerHTML = opts.template

  var parseStream = new parser({
    onopentag : function (name,attr) {
      dex.depth++
      for (a in attr) {
        var str = attr[a].match(/(\{\{\/?[^\}\}]+\}\})/)
        if (str) dex.add(str[0])
      } 
    },
    ontext : function (txt) {
      var str = txt.match(/(\{\{\/?[^\}\}]+\}\})/)
      if (str) dex.add(str[0])
    },
    onclosetag : function (n) {}
  })

  parseStream.write(opts.template)
  parseStream.end()

  return dex.hash()
}

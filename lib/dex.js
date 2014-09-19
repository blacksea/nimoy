var parser = require('htmlparser2/lib/Parser')
var _ = require('underscore')

var Dex = function (d) {
  var self = this
  var c_depth = 0
  var child = false
  var offset = 0
  var parent = null
  var hash = {}

  this.depth = 1
  this.hash = function () { return hash }
  this.add = function (str) {
    var res = {}

    // remove triple brackets!
    str = str.replace(/\{|\}/g,'')
    // but how to handle the html inside!

    if (str[0] === '#') { 
      child = true
      offset = self.depth
      parent = str.slice(1)
    } else if (str[0] === '/') { 
      for (var i=0;i<d[parent].length;i++) {
        if (i===0) self.depth -= c_depth
        if (i>0) self.depth += c_depth
        if (!hash[self.depth]) hash[self.depth] = {}
        if (!hash[self.depth][parent]) hash[self.depth][parent] = {}
        hash[self.depth][parent] = d[parent][i]
      }
      child = false
      parent = null
    } else {
      if (child && parent) {
        c_depth = (self.depth-offset)+1
      }
      if (!child) {
        if (!hash[self.depth]) hash[self.depth] = {}
        hash[self.depth][str] = d[str]
      }
    }
  }
}

module.exports = function dax (opts) {
  if (!opts.data || !opts.template) {
    // console.error(new Error('Dex needs data and template options'))
    return null
  }

  var dex = new Dex(opts.data)
  var mindom = document.createElement('div')
  mindom.innerHTML = opts.template

  var parseStream = new parser({
    onopentag : function (name,attr) {
      for (a in attr) {
        var str = attr[a].match(/(\{\{\/?[^\}\}]+\}\})/)
        if (str) dex.add(str[0])
      } 
      dex.depth++
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

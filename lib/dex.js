var parser = require('htmlparser2/lib/Parser')

var Dex = function (d) {
  var depth = 0
  var c_depth = 0
  var child = false
  var hash = {}

  this.hash = function () { return hash }

  this.add = function (str) {
    str = (str.slice(0,2)==='{{{') 
      ? str.replace(/\{\{\{|\}\}\}/g,'')
      : str.replace(/\{\{|\}\}/g,'')

    if (str[0] === '#') {
      res.action = '#'
      var val = d[str.slice(1)]
      if (val && val instanceof Array) res.type = 'array'
      if (val && typeof val === 'boolean') res.type = 'boolean'
      res.key = str.slice(1)
    } else if (str[0] === '/') { 
      res.key = str
      res.action = '/'
    }
  }
}

module.exports = function dax (opts) {
  if (!opts.data || !opts.template) {
    console.error(new Error('Dex needs data and template options'))
    return false
  }

  var dex = new Dex(opts.data)

  var parseStream = new parser({
    onopentag : function (name,attr) {
      if (!attr) return false
      for (a in attr) {
        var str = attr[a].match(/({{\/?[^\}\}]+\}\})/)
        if (str) dex.add(str[0])
      }
    },
    ontext : function (txt) {
      var str = txt.match(/({{\/?[^\}\}]+\}\})/)
      if (str) dex.add(str[0])
    },
    onclose : function (n) {}
  })
  parseStream.write(opts.template)
  parseStream.end()

  return dex.hash
}

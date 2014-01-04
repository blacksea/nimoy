// WILDS MAPPER

var asyncMap = require('slide').asyncMap
var through = require('through')
var fs = require('fs')

module.exports = Map

function Map (path, ready) {
  var MAP = {}

  function readPKG (fileName, next) {
    var pkgFile = fs.readFileSync(path+fileName+'/package.json')
    var pkg = JSON.parse(pkgFile)
    if (pkg.brico) {
      s.write(buf)
      MAP[fileName] = pkg
      next() 
    } else {
      next()
    }
  }

  if (path[path.length-1] !== '/') path += '/'

  fs.readdir(path, function moduleList(e, modules) {
    asyncMap(modules, readPKG, function () {
      ready(JSON.stringify(MAP,null,2))
    })
  })

  var s = through(function write (chunk) {
    self.emit('data', chunk)
  }, function end () {
    this.end()
  },{autoDestroy:false})

  return s
}

// WILDS MAPPER

var asyncMap = require('slide').asyncMap
var fs = require('fs')

module.exports = Map

function Map (path, ready) {
  var MAP = {}

  function readPKG (fileName, next) {
    fs.readFile(path+fileName+'/package.json', function (e, buf) {
      if (e) console.error(e)
      if (!e) {
        var jsn = JSON.parse(buf)
        MAP[fileName] = jsn
        next() 
      }
    })
  }

  if (path[path.length-1] !== '/') path += '/'

  fs.readdir(path, function moduleList(e, modules) {
    asyncMap(modules, readPKG, function () {
      ready(JSON.stringify(MAP,null,2))
    })
  })
}

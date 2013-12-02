// WILDS MAPPER
// grab nimoy module data from a dir of node modules with package.json's

var asyncMap = require('slide').asyncMap
var fs = require('fs')

module.exports = Map

function Map (path, ready) {
  if (path[path.length-1] !== '/') path += '/'

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

  fs.readdir(path, function moduleList(e, modules) {
    asyncMap(modules, readPKG, function () {
      ready(JSON.stringify(MAP,null,2))
    })
  })
}

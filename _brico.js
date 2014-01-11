// BRICO

var level = require('level')
var through = require('through')

function mapWilds (wilds, fin) {
  var asyncMap = require('slide').asyncMap
  var MAP = {}

  function readPkg (modDir, next) {
    var pkg = JSON.parse(fs.readFileSync(wilds+modDir+'/package.json'))
    if (pkg.brico) { 
      MAP[pkg.name] = pkg 
      next() 
    } else next()
  }

  fs.readdir(wilds, function moduleList  (e, modules) {
    if (!e) asyncMap(modules, readPkg, fin)
  })
}

var s = through(function write (chunk) {

}, function end () {
  this.end()
})

var bricoleur = function (opts) {

}

module.exports = bricoleur

// var fern = require('fern')
// bricoleur = new fern({key:'api',tree:brico})

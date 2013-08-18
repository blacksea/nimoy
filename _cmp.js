var Duplex = require('stream').Duplex
, asyncMap = require('slide').asyncMap
, browserify = require('browserify')
, uglifyJS = require('uglify-js')
, stylus = require('stylus') 
, util = require('util')
, fs = require('fs')

util.inherits(Compiler, Duplex)

module.exports = Compiler
// compiler prepares files for client

function Compiler (opts) {
  if (!(this instanceof Compiler)) return new Compiler(opts)
  Duplex.call(this, opts)

  var self = this
  , DIR = './_wilds/'
  , READ1 = false
  , CSS = ''
  , MODCOUNT = 0
  , MODS = []
  , B = browserify()

  this._write = function (chunk, enc, next) {
    var mod = JSON.parse(chunk.toString())
    handleModule(mod)
    next()
  }

  this.end = function () {
    READ1 = true
  }

  function handleModule (mod) {
    if (READ1===false) MODCOUNT++
    asyncMap(mod.deps, function readModDeps (file, next) {
      var filepath = DIR+file
      var ext = file.split('.')[1]
      fs.readFile(filepath, function addDepToMod (err, buf) {
        if (err) console.error(err)
        mod[ext] = buf.toString()
        next()
      })
    }, function handledDeps () {
       MODS.push(mod) 
       if (MODCOUNT === MODS.length) self.compile()
    })
  }

  this.compile = function () {
    asyncMap(MODS, function (mod, next) {
      if (mod.styl) CSS += mod.styl // add style to css
      var fil = DIR+mod.id+'.js'
      B.add(DIR+mod.id+'.js') // add js to browserify
      next()
    }, function () {
      var bunF = fs.createWriteStream(DIR+'_bundle.js')
      B.bundle().pipe(bunF)
      bunF.on('finish', function () {
        console.log('wrote bundle')
      })
      bunF.on('error', function (e) {
        console.error(e)
      })
      stylus.render(CSS, {filename:'_styles.css'}, function (e) {
        if (e) console.error(e)
        console.log('wrote css')
      })
    })
  }
}

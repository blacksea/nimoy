var Duplex = require('stream').Duplex
, asyncMap = require('slide').asyncMap
, browserify = require('browserify')
, uglifyJS = require('uglify-js')
, stylus = require('stylus') 
, inherits = require('inherits')
, fs = require('fs')

inherits(Compiler, Duplex);

module.exports = Compiler

function Compiler (opts) { // compiler prepares files for client
  if (!(this instanceof Compiler)) return new Compiler(opts)
  Duplex.call(this, opts)

  // store filepaths & generate index.html

  var self = this
  , DIR = './_wilds/'
  , UPDATE = false
  , READ1 = false
  , MODCOUNT = 0
  , MODS = []

  var index = '<!Doctype>\n<html>\n\t<head>\n\t'
  +'<script type="text/javascript" src="'+bundle+'"</script>'
  +'<link rel="stylesheet" type="text/css" href="'+stylesheet+'"</link>'
  +'</head>\n\t<body>\n\t<div id="container"></div>\n\t</body>\n</html>';

  this._write = function (chunk, enc, next) {
    if (READ1===false) MODCOUNT++
    var mod = JSON.parse(chunk.toString())
    handleModule(mod)
    next()
  }

  this.end = function () {
    READ1 = true
  }

  this.getMods = function (cb) {
    cb(MODS)
  }

  function handleModule (mod) {
    asyncMap(mod.deps, function readModDeps (file, next) {
      var filepath = DIR+file
      var ext = file.split('.')[1]
      fs.readFile(filepath, function addDepToMod (err, buf) {
        if (err) console.error(err)
        mod[ext] = buf.toString()
        next()
      })
    }, function handledDeps () {
       if (UPDATE === false) MODS.push(mod) 
       if (UPDATE === true) {
         for (var i=0;i<MODS.length;i++) {
           var m = MODS[i]
           if (m.id === mod.id) MODS[i] = mod 
         }
         ready()
       }
       if (MODCOUNT === MODS.length && UPDATE === false) {
         ready()
         UPDATE = true
       }
    })
  }

  function ready () {
    var CSS = ''
    fs.readFile(opts.stylesPath, function (e, buf) { // load base styles
      if (e) console.error(e)
      CSS += buf.toString()
      compile(CSS) 
    })
  }

  // refactor this!
  function compile (CSS) {
    var b = browserify()
    b.add(opts.jsPath)
    asyncMap(MODS, function (mod, next) {
      if (mod.styl) CSS += mod.styl // add style to css
      var fil = DIR+mod.id+'.js'
      b.require(DIR+mod.id+'.js',{expose:mod.id.toUpperCase()}) // add js to browserify
      next()
    }, function () {
      var bunF = fs.createWriteStream(opts.bundlePath)
      b.bundle({debug:true}).pipe(bunF)
      bunF.on('close', function () {
        console.log('wrote _bundle.js')
        if (opts.compress === true) {
          var min = uglifyJS.minify(opts.bundlePath) 
          fs.writeFile(opts.bundlePath, min.code, function (e) {
            if (!e) console.log('wrote minified _bundle.js')
          })
        }
      })
      bunF.on('error', function (e) {
        console.error(e)
      })
      stylus.render(CSS, {filename:opts.cssPath}, function (e, css) {
        if (e) console.error(e)
        fs.writeFile(opts.cssPath, css, function (e) {
          if (e) cosole.error(e)
          console.log('wrote _styles.css')
        })
      })
    })
  }
}

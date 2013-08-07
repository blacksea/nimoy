var telepath = require('tele')
, asyncMap = require('slide').asyncMap
, browserify = require('browserify')
, uglifyJS = require('uglify-js')
, stylus = require('stylus')
, fern = require('fern')
, fs = require('fs')

module.exports = function (opts) { // MAPPER
  telepath(this) 

  var self = this
  , DESTCSS = './_wilds/_styles.css'
  , DESTJS = './_wilds/_bundle.js'
  , CSS = ''
  , FILESTAT = null

  // completely restructure this thing with a tidy fern/event harness!
  fs.watch(opts.dir, function (event, file) { 
    var filepath = opts.dir+'/'+file
    fs.stat(filepath, function (err, stats) {
      // make a good data object here
      stats.filepath = filepath
      if (err) console.log(err)
      if (!fileStat) fileStat = stats
      if (fileStat.size !== stats.size) update(stats)
      fileStat = stats
    })
  })

  function update (stats) {
    console.log(stats)
  }
 
  this.survey = function (cb) { 
    fern([  
      [self.map, opts.dir]
      , self.compileCSS
      , self.compileJS
    ], function () {
        self.send({event:'mapping_done'})
        cb()
    })
  }
    
  this.map = function (dir, cb) {
    fs.readdir(dir, function (err, files) {
      if (!err) handleFiles(files, cb)
    })

    function handleFiles (files, cb) {
      asyncMap(files, HandleFile, function () {
        cb()
      })
    }

    function HandleFile (file, cb) {
      var filepath = opts.dir+'/'+file
      if (file.split('.')[1] === 'js') fs.readFile(filepath, function (err, buffer) {
        var data = buffer.toString()
        , moduleData = null
        , buf = ''

        for (var i=0;i<data.length;i++) { // parse out data object
          buf += data[i]
          if (data[i] === '}' && data[1] === '*' && data[2] === '{') {
            moduleData = JSON.parse(buf.toString().replace('/*',''))
            moduleData.filePath = filepath
            moduleData.key = 'module_map' // intent of data packet !?
            for (var i=0;i<moduleData.scope.length;i++) {
              if (moduleData.scope[i]==='client') opts.js.push(filepath)
            }
            break
          }
        }

        if (moduleData && moduleData.deps) { // if there are deps handle them
          asyncMap(moduleData.deps, function (dep, cb) {
            fs.readFile(opts.dir+'/'+dep, function (err,buffer) {
              moduleData[dep.split('.')[1]] = buffer.toString()
              if (dep.split('.')[1]==='styl') CSS += buffer.toString()
              cb()
            })
          }, function () {
            self.send(moduleData)
            cb()
          })
        } else if (moduleData) {
          self.send(moduleData)
          cb()
        } else cb()
      })
      else cb()
    }
  }

  this.compileCSS = function (arr, cb) {
    fs.readFile(opts.css, function (err, buffer) { // handle css
      if (err) cb(err)
      var styles = buffer.toString()
      styles += CSS
      stylus.render(styles, {filename:destCSS}, function (err, css) {
        if (err) cb(err)
        fs.writeFile(destCSS, css, cb)
      })
    })
  }

  this.compileJS = function (arr, cb) { 
    var b = browserify(opts.js)
    asyncMap(opts.js, function (item, cb) {
      var path = item.split('/')
      if (path[1] === '_wilds') b.require(item, {expose:path[2].replace('.js','')}) 
      cb()
    }, function () {
      b.bundle(function (err, bundle) {
        if (opts.compress === true) {
          var bundlemin = uglifyjs.minify(bundle,{fromstring: true})
          bundle = bundlemin.code
        }
        fs.writeFile(destJS, bundle, function (err) {
          cb(err)
        })
      })   
    })
  }
}

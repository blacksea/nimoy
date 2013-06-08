var browserify = require('browserify')
, uglifyJS = require('uglify-js')
, stylus = require('stylus')
, telepath = require('tele')
, async = require('async')
, fs = require('fs')

module.exports = function (opts) { // PRECOMPILER
  telepath(this)

  if (!opts) opts = {compress:false}
  if (!opts.compress) opts.compress = false

  var self = this
  , destCSS = './_wilds/_styles.css'
  , destJS = './_wilds/_bundle.js'
  , CSS = ''

  var map = {
    meta: 'module_map',
    client: [],
    server: []
  }

  this.recv = function (moduleData) {
    var mod = JSON.parse(moduleData.toString())
    if (typeof mod === 'object' && !mod.event) {
      for (var i=0;i<mod.scope.length;i++) {
        var scope = mod.scope[i]
        if (scope==='client') opts.js.push(mod.filePath) // add to browserify
        if (mod.styl) CSS += mod.styl
        map[scope].push(mod)
      }
    }
    if (mod.event === 'finish') {
      console.log('updating')
      compile()
      self.send(map)
      fs.writeFile('./_info/moduleMap.json', JSON.stringify(map,null,2), function (err) {
        if (!err)  console.log('wrote moduleMap.json')
        map = {
          meta: 'module_map',
          client: [],
          server: []
        }
      })
    }
  }
    
  // self.in.on('finish', function () {
  //   compile()
  //   self.send(map)
  //   fs.writeFile('./_info/moduleMap.json', JSON.stringify(map,null,2), function (err) {
  //     if (!err)  console.log('wrote moduleMap.json')
  //   })
  // })

  function compile () { // rewrite this to handle browserify properly
    var b = browserify(opts.js)

    async.forEach(opts.js, function (item, cb) {
      var path = item.split('/')
      if (path[1]==='_wilds') b.require(item, {expose:path[2].replace('.js','')}) 
      cb()
    }, function () {
      b.bundle(function (err, bundle) {
        if (err) throw err
        if (opts.compress === true) {
          var bundleMin = uglifyJS.minify(bundle,{fromString: true})
          bundle = bundleMin.code
        }
        fs.writeFile(destJS, bundle, function (err) {
          if (err) throw err
          console.log('fin')
          // self.out.emit('end') // closes brico - figure out somekind of micro-stream-process api
        })
      })   
    })

    fs.readFile(opts.css, function (err, buffer) {
      if (err) throw err
      var styles = buffer.toString()
      styles += CSS
      stylus.render(styles, {filename:destCSS}, function (err, css) {
        if (err) throw err
        fs.writeFile(destCSS, css, function (err) {
          if (err) throw err
          console.log('css compiled')
          // cb();
        })
      })
    })
  }
}

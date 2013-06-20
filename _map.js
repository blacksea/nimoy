var telepath = require('tele')
, browserify = require('browserify')
, uglifyJS = require('uglify-js')
, stylus = require('stylus')
, async = require('async')
, fs = require('fs')

module.exports = function (opts) { // MAPPER
  telepath(this) 

  var self = this
  , stat = null // hacky stat var for putting stat obj
  , destCSS = './_wilds/_styles.css'
  , destJS = './_wilds/_bundle.js'
  , CSS = ''

  if (opts.watch === true) fs.watch(opts.dir, function (event, file) { // dynamic module reloading
    if (event === 'change') {
      fs.stat(opts.dir+'/'+file, function (err, stats) {
        if (err) throw new Error(err)
        if (!stat) stat = stats
        if (stat.size !== stats.size) {
          // trigger recompile
          console.log(file+' modified on: '+stat.mtime+' new size is: '+stat.size)
        }
      })
    }
  })
 
  this.survey = function () { 
    async.waterfall([
      ReadDir,
      HandleFiles,
    ], function (err, result) {
      compileJS()
      compileCSS()
      if (err) throw new Error(err)
    })

    function ReadDir (cb) {
      fs.readDir(opts.dir, function (err, files) {
        if (err) throw new Error(err)
        cb(null, files)
      })
    }

    function HandleFiles (err, cb) {
      async.each(files, function (file, cb) {
        var filepath = opts.dir+'/'+file
        if (file.split('.')[1] === 'js') fs.readFile(filepath, function (err, buffer) {
          if (err) throw err
          var data = buffer.toString()
          , moduleData = null
          , buf = ''

          for (var i=0;i<data.length;i++) { // parse out data object
            buf += data[i]
            if (data[i] === '}' && data[1] === '*' && data[2] === '{') {
              moduleData = JSON.parse(buf.toString().replace('/*',''))
              moduleData.filePath = filePath
              break
            }
          }

          if (moduleData && moduleData.deps) { // if there are deps handle them
            async.each(moduleData.deps, function (dep, cb) {
              fs.readFile(dir+'/'+dep, function (err,buffer) {
                if (err) throw err
                moduleData[dep.split('.')[1]] = buffer.toString()
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
      }, cb)
    }
  }

  function compileCSS (cb) {
    fs.readFile(opts.css, function (err, buffer) { // handle css
      if (err) throw err
      var styles = buffer.toString()
      styles += CSS
      stylus.render(styles, {filename:destCSS}, function (err, css) {
        if (err) throw err
        fs.writeFile(destCSS, css, function (err) {
          if (err) throw err
          cb(null)
        })
      })
    })
  }
  
  function compileJS (cb) { 
    var b = browserify(opts.js)

    async.forEach(opts.js, function (item, cb) {
      var path = item.split('/')
      if (path[1] === '_wilds') b.require(item, {expose:path[2].replace('.js','')}) 
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
          cb(null)
        })
      })   
    })
  }
}

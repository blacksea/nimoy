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

  if (opts.watch === true) { 
    fs.watch(opts.dir, function (event, file) {
      if (event === 'change') checkFileChange(file)
    })
  }

  function checkFileChange (file) {
    fs.stat(opts.dir+'/'+file, function (err, stats) {
      if (!err) {
        if (!stat) stat = stats
        if (stat.size !== stats.size) {
          // send recompile event
          // resurvey
          console.log(file+' modified on: '+stat.mtime+' new size is: '+stat.size)
        }
      }
    })
  }
  
  this.survey = function () {
    // make browserify bundle
    var b = browserify(opts.js)
    async.forEach(opts.js, function (item, cb) {
      var path = item.split('/')
      if (path[1]==='_wilds') b.require(item, {expose:path[2].replace('.js','')}) 
      cb()
    }, makeBundle)

    // handle files 
    fs.readdir(opts.dir, HandleFiles)
  }

  function makeBundle () {
    b.bundle(function (err, bundle) {
      if (err) throw err

      if (opts.compress === true) {
        var bundleMin = uglifyJS.minify(bundle,{fromString: true})
        bundle = bundleMin.code
      }

      fs.writeFile(destJS, bundle, function (err) {
        if (err) throw err
        console.log('fin')
        console.log(map) 
        map = {
          meta: 'module_map',
          client: [],
          server: []
        }
      })
    })   
  }

  function HandleFiles (err, files) {
    if (!err) async.each(files, HandleFile, MappingDone)
    if (err) throw err 
  }
  
  function HandleFile (file, callback) {
    var filepath = dir+'/'+file
    if (file.split('.')[1] === 'js') fs.readFile(filepath, getModuleData) // ignore hidden and non js files
    else callback()
    
    function getModuleData (err, buffer) {
      if (err) throw err
      var data = buffer.toString()
      , moduleData = null
      , buf = ''

      for (var i=0;i<data.length;i++) { // parse out data object
        buf += data[i]
        if (data[i] === '}' && data[1]==='*' && data[2]==='{') { // super clumsy replace**
          moduleData = JSON.parse(buf.toString().replace('/*','')) // maybe find a way to check valid json
          moduleData.filePath = filepath
          break
        }
      }
      
      if (moduleData && moduleData.deps) { // if there are deps handle them
        async.each(moduleData.deps, HandleDeps, function () {
          self.send(moduleData)
          callback()
        })
      } else if (moduleData) {
        self.send(moduleData)
        callback()
      } else callback()

      function HandleDeps (dep, cb) {
        fs.readFile(dir+'/'+dep, function (err,depBuffer) {
          if (err) throw err
          moduleData[dep.split('.')[1]] = depBuffer.toString()
          cb()
        })
      }
    }
  }

  function MappingDone () {
    self.send({event:'finish'})
  }
  
  }

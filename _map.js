var telepath = require('tele')
, async = require('async')
, fs = require('fs')

// MAPPER 
module.exports = function (dir) { 
  telepath(this) 
  var self = this

  fs.readdir(dir, HandleFiles)

  function HandleFiles (err, files) {
    if (!err) async.each(files, HandleFile, MappingDone)
    if (err) throw err 
  }
  
  function HandleFile (file, callback) {
    if (file.split('.')[1] === 'js') fs.readFile(dir+'/'+file, getModuleData) // ignore hidden and non js files
    else callback()
    
    function getModuleData (err, buffer) {
      if (err) throw err
      var data = buffer.toString()
      , moduleData = null
      , buf = ''

      for (var i=0;i<data.length;i++) { // parse out data object
        buf += data[i]
        if (data[i] === '}' && data[1]==='*' && data[2]==='{') { // super clumsy replace**
          if (typeof moduleData !== 'object') throw new Error('no module data!')
          moduleData = JSON.parse(buf.toString().replace('/*',''))
          break
        }
      }
      
      if (moduleData !== null && moduleData.deps) { // if there are deps handle them
        async.each(moduleData.deps, HandleDeps, function () {
          self.send(JSON.stringify(moduleData))
          callback()
        })
      } else if (moduleData !== null) {
        self.send(JSON.stringify(moduleData))
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
    self.send(JSON.stringify({event:'done'}))
  }
}

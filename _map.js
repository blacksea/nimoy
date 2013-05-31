var telepath = require('tele')
, async = require('async')
, fs = require('fs')

module.exports = function (dir) { // MAPPER
  telepath(this) 
  var self = this
  
  this.start = function (dir) {
    fs.readdir(dir, HandleFiles)
  }

  fs.readdir(dir, HandleFiles)

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
    // can't emit end because it will close brico in stream - modules should signal start and end of their process
    // self.out.emit('end')
    self.send({event:'finish'})
  }
}

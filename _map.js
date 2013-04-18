var Stream = require('stream'),
telepath = require('tele'),
async = require('async'),
fs = require('fs')

// MAPPER
module.exports = function (dir) {
  telepath(this)
  var self = this

  fs.readdir(dir, handleDir)

  function handleDir (err, files) {
    if (err) throw err
    if (!err) async.forEach(files, function (file, cb) {
      if (file.split('.')[1] === 'js') readFile(file, function (moduleData) {
        console.dir(moduleData)
        if (moduleData) self.send(moduleData)
      })
    })
  }

  function readFile (file, cb) {
    var fS = fs.createReadStream(filepath),
    filePath = dir+'/'+file,
    moduleData = {}

    fS.on('data', function (chunk) {
      var buffer = chunk.toString(),
      data = ''
      for (var i=0;i<buffer.length;i++) {
        if (buffer[i] === '}') {
          var obj = JSON.parse(buf.replace('/*',''))
          if (typeof obj === 'object') handleFile(obj)
          if (typeof obj !== 'object') cb()
          break 
        }
      }
    })

    function handleFile (obj) {
      moduleData = obj
      moduleData.filePath = filePath
      if (moduleData.deps) async.forEach(moduleData.deps, handleDep, cb)
      if (!moduleData.deps) cb()
    }

    function handleDep (dep, callback) {
      fs.readFile(dep, function (buffer) {
        moduleData[dep.split('.')[1]] = buffer.toString()  
        callback(moduleData)
      })
    }

  }
}

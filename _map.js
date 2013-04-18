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
        if (moduleData) self.send(JSON.stringify(moduleData))
      })
    })
  }

  function readFile (file, cb) {
    var filePath = dir+'/'+file,
    moduleData = {}

    fs.readFile(filePath, function (err, buffer) {
      var data = buffer.toString(),
      buf = ''

      for (var i=0;i<data.length;i++) {
        buf += data[i]
        if (data[i] === '}') {
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
      if (!moduleData.deps) cb(moduleData)
    }

    function handleDep (dep, callback) {
      fs.readFile(dir+'/'+dep, function (err, buffer) {
        moduleData[dep.split('.')[1]] = buffer.toString()  
        callback(moduleData)
      })
    }
  }
}

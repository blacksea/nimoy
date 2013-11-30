// WILDS MAPPER

// this should work with standard module format + 
// package.json files

// how to nicely extend / hack the package.json

var Readable = require('stream').Readable
var asyncMap = require('slide').asyncMap
var fs = require('fs')

// read through dir + look for specified package.json property
// use property to set behaviour + module scope

module.exports = Map

function Map (opts, mapStream) {
  if (opts.path_wilds[opts.path_wilds.length-1] !== '/') opts.path_wilds += '/'
  var FileStat 

  var s = new Readable({end:false})
  s._read = function () {} // WTF!

  fs.watch(opts.path_wilds, function handleFileChange (event, file) { 
    var filepath = opts.path_wilds+file
    fs.stat(filepath, function statFile (e, stats) {
      if (e) console.error(e)
      stats.filepath = filepath
      if (!FileStat) FileStat = stats
      if (FileStat.size !== stats.size) {
        var mod = stats.filepath.split('/')[2]
        var ext = mod.split('.')[1]
        var file = mod
        if (ext !== 'html') Fresh = true
        if (ext !== 'js') file = mod.split('.')[0]+'.js' 
        Parse(file, function () {
          console.log('updated '+ stats.filepath)
        })
      } 
      FileStat = stats
    })
  })
 
  function Parse (file, next) {
    var ext = file.split('.')[1]
    if (ext === 'js' && file[0] !=='_') {
      var f = fs.createReadStream(opts.path_wilds+file)
      f.on('data', function (chunk) {
        var buf = chunk.toString()
        var m = buf.match(/\/\*\{([\S\s]*)\}\*\//)
        var modJSON = m[0].replace('/*','').replace('*/','')
        if (Fresh === true) {
          var mod = JSON.parse(modJSON)
          mod.fresh = true
          modJSON = JSON.stringify(mod)
        }
        s.push(modJSON)
      })
      f.on('end', next) 
    } else {
      next()
    }
  }

  fs.readdir(opts.path_wilds, function handleWildsFiles (e, files) {
    mapStream(s)
    asyncMap(files, Parse, function doneWildsFiles () {
      s.emit('end')
    })
  })
}

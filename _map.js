// WILDS MAPPER

var through = require('through')
var asyncMap = require('slide').asyncMap
var fs = require('fs')

module.exports = Map

function Map (opts, mapStream) {
  if (opts.path_wilds[opts.path_wilds.length-1] !== '/') opts.path_wilds += '/'
  var FileStat 

  var rs = through(function write (chunk) {
    this.queue(chunk)
  }, function end () {
    this.emit('end')
  }

  fs.watch(opts.path_wilds, function handleFileChange (event, file) { 
    var filepath = opts.path_wilds+file
    fs.stat(filepath, function statFile (err, stats) {
      if (e) console.error(e)
      stats.filepath = filepath
      if (!FileStat) FileStat = stats
      if (FileStat.size !== stats.size) {
        var mod = stats.filepath.split('/')[2]
        var ext = mod.split('.')[1]
        var file = mod
        if (ext !== 'js') file = mod.split('.')[0]+'.js' 
        Parse(file, function () {
          console.log('updated '+file)
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
        var m = buf.match(/\/\*\{([\S\s]*)\}\*\//) // fix up this regex
        var modJSON = m[0].replace('/*','').replace('*/','')
        rs.write(modJSON)
      })
      f.on('end', next) 
    } else {
      next()
    }
  }

  fs.readdir(opts.path_wilds, function handleWildsFiles (e, files) {
    mapStream(rs)
    asyncMap(files, Parse, function doneWildsFiles () {
      rs.write(null)
    })
  })
}

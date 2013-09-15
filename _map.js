// WILDS MAPPER

var Readable = require('stream').Readable
var inherits = require('inherits')
var asyncMap = require('slide').asyncMap
var fs = require('fs')

inherits(Map, Readable)

module.exports = Map

function Map (opts, callback) {
  Readable.call(this)

  if (opts.path_wilds[opts.path_wilds.length-1] !== '/') opts.path_wilds += '/'

  var Self = this
  var FileStat 

  this._read = function (size) {} // WTF!

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

  fs.readdir(opts.path_wilds, function handleWildsFiles (e, files) {
    callback(self)
    asyncMap(files, Parse, function doneWildsFiles () {
      self.emit('end')
    })
  })
 
  function Parse (file,cb) {
    var ext = file.split('.')[1]
    if (ext === 'js' && file[0] !=='_') {
      var f = fs.createReadStream(opts.path_wilds+file)
      f.on('data', function (chunk) {
        var buf = chunk.toString()
        var m = buf.match(/\/\*\{([\S\s]*)\}\*\//) // fix up this regex
        var modJSON = m[0].replace('/*','').replace('*/','')
        self.push(modJSON)
      })
      f.on('end',cb) 
    } else {
      cb()
    }
  }
}

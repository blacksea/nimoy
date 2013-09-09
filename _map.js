var Readable = require('stream').Readable
var inherits = require('inherits')
var asyncMap = require('slide').asyncMap
var fs = require('fs')

inherits(Map, Readable)
module.exports = Map

function Map (opts, callback) {
  Readable.call(this)

  var L = opts.path_wilds[opts.path_wilds.length-1]
  if (L !== '/') opts.path_wilds += '/'

  var self = this
  var FILESTAT 

  this._read = function (size) {} // WTF!

  fs.readdir(opts.path_wilds, function handleWildsFiles (e, files) {
    callback(self)
    asyncMap(files, parse, function doneWildsFiles () {
      self.emit('end')
    })
  })

  fs.watch(opts.path_wilds, function handleFileChange (event, file) { 
    var filepath = opts.path_wilds+file
    fs.stat(filepath, function statFile (err, stats) {
      // make a good data object here
      stats.filepath = filepath
      if (err) console.error(err)
      if (!FILESTAT) FILESTAT = stats
      if (FILESTAT.size !== stats.size) {
        var mod = stats.filepath.split('/')[2]
        var ext = mod.split('.')[1]
        var file = mod
        if (ext !== 'js') file = mod.split('.')[0]+'.js' 
        if (file[0] !== '_') {
          parse(file, function () {
            console.log('updated '+file)
          })
        }
      } 
      FILESTAT = stats
    })
  })
  
  function parse (file,cb) {
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

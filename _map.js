var Readable = require('stream').Readable
, inherits = require('inherits')
, asyncMap = require('slide').asyncMap
, compressor = require('./_cmp')
, fs = require('fs')

inherits(Map, Readable)

module.exports = Map

function Map (opts, callback) {
  Readable.call(this)
  this.readable = true

  var self = this
  , DESTCSS = './_wilds/_styles.css'
  , DESTJS = './_wilds/_bundle.js'
  , DIR = opts.dir+'/'
  , CSS = ''
  , FILESTAT = null


  this._read = function (size) {} // WTF!

  fs.readdir(DIR, function handleWildsFiles (e, files) {
    callback(self)
    asyncMap(files, parse, function doneWildsFiles () {
      self.emit('end')
    })
  })

  fs.watch(DIR, function handleFileChange (event, file) { 
    var filepath = DIR+file
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
      console.log(file)
      var f = fs.createReadStream(DIR+file)
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

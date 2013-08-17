var Readable = require('stream').Readable
, asyncMap = require('slide').asyncMap
, compressor = require('./_cmp')
, fs = require('fs')

module.exports = function (opts, callback) {

  var self = this
  , DESTCSS = './_wilds/_styles.css'
  , DESTJS = './_wilds/_bundle.js'
  , DIR = opts.dir+'/'
  , CSS = ''
  , FILESTAT = null

  this.server = new Readable
  this.client = new Readable

  this.server._read = function (size) {} // WTF!
  this.client._read = function (size) {}

  fs.readdir(DIR, function handleWildsFiles (e, files) {
    callback(self.server)
    asyncMap(files, parse, function doneWildsFiles () {
      console.log('enddddddd')
      self.server.push(null)
    })
  })

  fs.watch(DIR, function handleFileChange (event, file) { 
    var filepath = DIR+file
    fs.stat(filepath, function statFile (err, stats) {
      // make a good data object here
      stats.filepath = filepath
      if (err) console.error(err)
      if (!FILESTAT) FILESTAT = stats
      if (FILESTAT.size !== stats.size) self.server.emit('change',FILESTAT)
      FILESTAT = stats
    })
  })
  
  function parse (file,cb) {
    var ext = file.split('.')[1]
    if (ext === 'js' && file[0] !=='_') {
      var f = fs.createReadStream(DIR+file)
      f.on('data', function (chunk) {
        var buf = chunk.toString()
        var m = buf.match(/\/\*\{([\S\s]*)\}\*\//) // fix up this regex
        var modJSON = m[0].replace('/*','').replace('*/','')
        var modOBJ = JSON.parse(modJSON)
        modOBJ.scope.forEach(function (scope) { // push to scoped stream
          self[scope].push(modJSON)
        })
      })
      f.on('end',cb) 
    } else {
      cb()
    }
  }

  self.client.on('data', function (d) {
    console.log('plexd'+d.toString())
  })
}

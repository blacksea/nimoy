var telepath = require('tele')
, browserify = require('browserify')
, uglifyJS = require('uglify-js')
, stylus = require('stylus')
, async = require('async')
, fs = require('fs')

module.exports = function (opts) { // MAPPER
  telepath(this) 

  var self = this
  , stat = null // hacky stat var for putting stat obj
  , destCSS = './_wilds/_styles.css'
  , destJS = './_wilds/_bundle.js'
  , CSS = ''
  
  this.survey = function () { 

    async.waterfall([
      readDir,
      handleFiles,
      preCompile
    ], function (err, result) {
      if (err) throw new Error(err)
      if (!err) console.dir(result)
    })

    function readDir (cb) {
      fs.readDir(opts.dir, function (err, files) {
        if (!err) cb(null, files)
      })
    }

    function handleFiles (files, cb) {

    }

    function preCompile (cb) {

    }
  }
}

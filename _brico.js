var MuxDemux = require('mux-demux')
, Stream = require('stream')
, telepath = require('tele')
, async = require('async')

module.exports = function (usr) { // BRICOLEUR 
  var self = this
  telepath(this)
  console.dir(self)

  if (usr) self.usr = usr

  this.test = function (data) {
    console.dir(data)
  }
  this.recv = function (data) {
    console.dir(data.toString())
  }
}

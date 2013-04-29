// BRICOLEUR 
var MuxDemux = require('mux-demux')
, Stream = require('stream')
, async = require('async')

module.exports = function (usr) {
  var self = this
  this.test = function (data) {
    console.dir(data)
  }
}

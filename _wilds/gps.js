/*{
  "id":"gps",
	"scope":["server"],
	"desc":"interface for gps serial data"
}*/

// built with wgps module

var SerialPort = require('serialport')
, Stream = require('stream').Stream
, inherits = require('inherits')

function Gps (opts) {
  Stream.call(this)
  this.readable = true
  this.writable = true
  var self = this

  if (!opts) {
    opts = {
      port:'/dev/ttyAMA0',
      baud:97600
    }
  }

  var serialStream = new serialPort(opts.port, {
    baudrate:opts.baud, 
    parser:SerialPort.parsers.readline('\n')
  })

  serialStream.pipe(this)

  this._write = function (enc, chunk, next) {
    parse(chunk) 
    next()
  }
  this._read = function (size) {}
  this.end = function () {
    console.log('data end')
  }
  this.on('error', function (e) {
    console.error(e)
  })

  function parse (data) {
    var gd = {

    }
    self.emit('data', JSON.stringify(gd))
  }
}  

inherits(Gps, Stream)
module.exports = Gps

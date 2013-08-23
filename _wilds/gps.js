/*{
  "id":"gps",
	"scope":["server"],
	"desc":"interface for gps serial data"
}*/

//shout out to werners gps: https://github.com/vesteraas/wgps

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

  this._read = function (size) {}
  this._write = function (enc, chunk, next) {
    parse(chunk) 
    next()
  }
  this.end = function () {
    console.log('data end')
  }
  this.on('error', function (e) {
    console.error(e)
  })

  function parse (data) {
    console.log(data)
    // examine nmea sentances from serial and parse
    // look at werners logic module https://github.com/vesteraas/aarlogic_gps_3t/blob/master/lib/aarlogic_gps_3t.js
    var gd = {
    }
    self.emit('data', JSON.stringify(gd))
  }
}  

inherits(Gps, Stream)
module.exports = Gps

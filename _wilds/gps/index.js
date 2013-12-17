// GPS

var serial = require('serialport')
var through = require('through')

module.exports = GPS

var Parser = function () {

  function decimalDegrees (coordinate, direction) {
    var parts = coordinate.split('.');
    var sign = 1;
    var degrees;
    var minutes;
    var seconds;

    if (parts[0].length === 4) {
      degrees = parseInt(parts[0].substr(0, 2), 10);
      minutes = parseInt(parts[0].substr(2, 2), 10);
      seconds = parseFloat('0.' + parts[1]) * 60.0;
      if (direction.toLowerCase() === 's') {
        sign = -1;
      }
    } else if (parts[0].length === 5) {
      degrees = parseInt(parts[0].substr(0, 3), 10);
      minutes = parseInt(parts[0].substr(3, 2), 10);
      seconds = parseFloat('0.' + parts[1]) * 60.0;
      if (direction.toLowerCase() === 'w') {
        sign = -1;
      }
    }
    return sign * (degrees + minutes / 60.0 + seconds / 3600.0);
  }

  this.GPRMC = function (data, cb) { // gets called for GPRMC mssgs
    var o = {
      code:data[0],
      status:data[3],
      latitude:decimalDegrees(data[4], data[5]),
      longitude:decimalDegrees(parts[6], parts[7]),
      speedOverGroundInKnots:parseFloat(data[8]),
      courseOverGround:parseFloat(data[9])
    }
    cb(null,o)
  }
}

function Gps (opts) {
  var self = this
  var parser = new Parser

  if (!opts) {
    opts = {
      port:'/dev/ttyAMA0',
      baud:9600
    }
  }

  var serialStream = new serial.SerialPort(opts.port, {
    baudrate:opts.baud, 
    parser:serial.parsers.readline('\n')
  })

  var s = through(function write (chunk) {
    var sentence = chunk.substring(1).split(',')
    var type = sentence[0]
    if (parser[type]) {
      parser[type](sentence, function handleData (e, json) {
        if (e) this.emit('error', e)
        if (!e) this.emit('data', json)
      })
    }
    if (!parser[type]) self.emit('error', 'NMEA sentence unknown')
  }, function end () {
    this.emit('end')
  })

  serialStream.pipe(s)

  return s
}  

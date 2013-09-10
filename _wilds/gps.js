/*{
  "id":"gps",
	"process":["node"],
	"desc":"interface for gps serial data"
}*/

var serial = require('serialport')
var through = require('through')

module.exports = Gps

var Parser = function () { //shout out to werners gps: https://github.com/vesteraas/wgps

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
      degrees = parseInt(parts[0].substr(0, 3), 10); minutes = parseInt(parts[0].substr(3, 2), 10); seconds = parseFloat('0.' + parts[1]) * 60.0;
      if (direction.toLowerCase() === 'w') {
        sign = -1;
      }
    }
    return sign * (degrees + minutes / 60.0 + seconds / 3600.0);
  }

  this.GPGGA = function (data, cb) {
    var o = {
      code:data[0],
      time:data[1],
      latitude:decimalDegrees(data[2], data[3]),
      longitude:decimalDegrees(data[4], data[5]),
      fixQuality: parseInt(data[6], 10),
      numberOfSatellites: parseInt(data[7], 10),
      hdop: parseFloat(data[8]),
      altitudeInMeters: data[9],
      heightAboveGeoidInMeters: data[11],
      DGPSAgeInSeconds: parseInt(data[13]),
      DGPSStationId: data[14]
    }
    cb(null,o)
  } 
  this.GPVTG = function (data, cb) {
    var o = {
      code:data[0],
      trackMadeGood: parseFloat(data[1]),
      speedOverGroundInKnots: parseFloat(data[5]),
      speedOverGroundInKilometersPerHour: parseFloat(data[7])
    }
    cb(null,o)
  }
  this.GPRMC = function (data, cb) {
    var o = {
      code:data[0],
      // time:tools.timestamp_object(parts[pc++]),
      status:data[2],
      latitude:decimalDegrees(data[3], data[4]),
      longitude:decimalDegrees(data[5], data[6]),
      speedOverGroundInKnots:parseFloat(data[7]),
      courseOverGround:parseFloat(data[8]),
      // date:      tools.date_object(parts[pc++]),
      // magneticVariation: tools.magnetic_variation(parts[pc++], parts[pc++])
    }
    cb(null,o)
  }
}

function Gps (opts) {
  var self = this
  var parser = new Parser()

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

  this.s = through(write, end, {autoDestroy:false})
  serialStream.pipe(self.s)

  function write (chunk) {
    console.log(chunk)
    var sentence = chunk.substring(1).split(',')
    var type = sentence[0]
    if (parser[type]) {
      parser[type](sentence, function handleData (e, json) {
        if (e) self.s.emit('error', e)
        if (!e) self.s.queue(JSON.stringify(json,null,2))
      })
    }
  }
  function end () {
    console.log('data end')
  }
}  

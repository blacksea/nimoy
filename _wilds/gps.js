/*{
  "id":"gps",
	"scope":["server"],
	"desc":"interface for gps serial data"
}*/

//shout out to werners gps: https://github.com/vesteraas/wgps
var serial = require('serialport')
, Stream = require('stream').Stream
, inherits = require('inherits')

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
  // this.GPGGA = function (data, cb) {
  //   var o = {
  //     code:        code,
  //     time:        tools.timestamp_object(parts[pc++]),
  //     latitude:    tools.decimal_degrees(parts[pc++], parts[pc++]),
  //     longitude:   tools.decimal_degrees(parts[pc++], parts[pc++]),
  //     fixQuality: parseInt(parts[pc++], 10),
  //     numberOfSatellites: parseInt(parts[pc++], 10),
  //     hdop: parseFloat(parts[pc++]),
  //     altitudeInMeters: tools.altitude_in_meters(parts[pc++], parts[pc++]),
  //     heightAboveGeoidInMeters: tools.altitude_in_meters(parts[pc++], parts[pc++]),
  //     DGPSAgeInSeconds: parseInt(parts[pc++]),
  //     DGPSStationId: parts[pc++]
  //   }
  // }
  // this.GPGSV = function (data, cb) {
  //   var o = {
  //     code:        code,
  //     totalMessages: parseInt(parts[pc++]),
  //     messageNumber: parseInt(parts[pc++]),
  //     totalNumberOfSatellitesInView: parseInt(parts[pc++]),
  //     satellites: [tools.satellite(parts[pc++], parts[pc++], parts[pc++], parts[pc++]), tools.satellite(parts[pc++], parts[pc++], parts[pc++], parts[pc++]), tools.satellite(parts[pc++], parts[pc++], parts[pc++], parts[pc++]), tools.satellite(parts[pc++], parts[pc++], parts[pc++], parts[pc++])]
  //   }
  // }
  // this.GPGSA = function (data, cb) {
  //   var o = {
  //     code:        code,
  //     totalMessages: parseInt(parts[pc++]),
  //     messageNumber: parseInt(parts[pc++]),
  //     totalNumberOfSatellitesInView: parseInt(parts[pc++]),
  //     satellites: [tools.satellite(parts[pc++], parts[pc++], parts[pc++], parts[pc++]), tools.satellite(parts[pc++], parts[pc++], parts[pc++], parts[pc++]), tools.satellite(parts[pc++], parts[pc++], parts[pc++], parts[pc++]), tools.satellite(parts[pc++], parts[pc++], parts[pc++], parts[pc++])]
  //   }
  // }
  // this.GPVTG = function (data, cb) {
  //   var o = {
  //     code:        code,
  //     trackMadeGood: parseFloat(parts[1]),
  //     speedOverGroundInKnots: parseFloat(parts[5]),
  //     speedOverGroundInKilometersPerHour: parseFloat(parts[7])
  //   }
  // }
  this.GPRMC = function (data, cb) {
    var o = {
      code:data[0],
      // time:      tools.timestamp_object(parts[pc++]),
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
  Stream.call(this)
  this.readable = true
  this.writable = true
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

  serialStream.pipe(this)

  this._read = function (size) {}
  this.write = function (chunk) {
    var sentence = chunk.substring(1).split(',')
    var type = sentence[0]
    if (parser[type]) {
      parser[type](sentence, function handleData (e, d) {
        if (e) self.emit('error', e)
        if (!e) self.emit('data', JSON.stringify(d,null,'\t'))
      })
    }
  }
  this.end = function () {
    console.log('data end')
  }
  this.on('error', function (e) {
    console.error(e)
  })
}  

inherits(Gps, Stream)
module.exports = Gps

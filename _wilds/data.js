/*{
  "id":"data",
	"scope":["server"],
	"desc":"data(redis) api/interface"
}*/

var redis = require('redis')
, client = redis.createClient()
, telepath = require('tele')

module.exports = function () {
  var self = this
  telepath(this)

  this.recv = function (json) {
    var data = JSON.parse(json)
    for (key in data) {
      switch (key) {
        case 'set': self.set(data[key]);break;
        case 'get': self.get(data[key]);break;
        case 'hset': self.hset(data[key]);break;
        case 'hget': self.hget(data[key]);break;
      }
    }
  }

  this.set = function (params) {
    var key = params[0]
    , val = params[1]
    client.set(key, val)
  }

  this.get = function (key) {
    client.get(key, function (err, data) {
      if (err) throw err
      self.send(data)
    })
  }

  this.hset = function (params) {
    var hash = params[0]
    , key = params[1]
    , val = params[2]

    client.hset(hash, key, val)
  }

  this.hget = function (prams, cb) {
    var hash = params[0]
    , key = params[1]
    , val = params[2]

    client.hget(params, cb)
  }
}  

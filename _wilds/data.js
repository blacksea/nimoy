/*{
  "id":"data",
	"scope":["server"],
	"desc":"data(redis) api/interface"
}*/

var _ = Object._;

var redis = require('redis')
, client = redis.createClient();
// an easy api to store retreive data // map filter
module.exports = function () {
  var self = this;
  this.test = function () {
    console.log('data!!!!!!!!!!!');
  }
  this.set = function (params) {
    var key = params[0]
    , val = params[1];
    client.set(key, val);
  }
  this.get = function (key, err, cb) {
    client.get(key, cb);
  }
  this.hset = function (params) {
    var hash = params[0]
    , key = params[1]
    , val = params[2];
    client.hset(hash, key, val);
  }
  this.hget = function (prams, cb) {
    var hash = params[0]
    , key = params[1]
    , val = params[2];
    client.hget(params, cb);
  }
  // support for lists / hashes ????!!!
  // data implementation -------- 
}  

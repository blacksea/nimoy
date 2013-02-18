// D A T A 
var redis = require('redis')
, client = redis.createClient();

module.exports = function () {
  var self = this;
  this.insert = function (params) {
    var key = params[0]
    , val = params[1];
    client.set(key, val);
  }
  this.get = function (key, err, cb) {
    client.get(key, cb);
  }
  // support for lists / hashes ????!!!

}

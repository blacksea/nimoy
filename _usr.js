var redis = require('redis'),
client = redis.createClient()

var defaultUser = { // default user object
  name:'default',
  domain:'localhost',
  modules:['data']
}

module.exports = function () { // user superclass/a wrapper for brico
  var self = this

  this.add = function (usrObj) {
  }
  this.remove = function (usrObj) {
  }
}

var redis = require('redis')
, async = require('async')
, client = redis.createClient()

var user = { // default user object
  name:'default',
  domain:'127.0.0.1',
  modules:['data']
}

client.hset('users', user.name, JSON.stringify(user), function (err) {
  if (err) throw err
})

module.exports = function () { // user superclass/a wrapper for brico
  var self = this
  this.buildUsers = function (cb) {
    client.hgetall('users', function (err, users) { 
      for (user in users) {
        var usr = JSON.parse(users[user])
        cb(usr)
      }
    })
  }
  this.add = function (usrObj) {
  }
  this.remove = function (usrObj) {
  }
}

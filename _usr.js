// USERS

var redis = require('redis'),
client = redis.createClient()

var Users = function (opts, cb) {

  var self = this
  this.basic = { // default user
    name:'default',
    domain:'localhost',
    routes:[
      {url:"/",
      file:"./_wilds/_index.html"},
      {url:"/_bundle.min.js",
      file:"./_wilds/_bundle.min.js"},
      {url:"/_styles.css",
      file:"./_wilds/_styles.css"}
    ],
    modules:['data']
  }

  this.addUser = function (json) { // add a user
    var user = JSON.parse(json)
    client.hset('users', user.name, user)
  }

  this.getUsers = function (cb) {
    client.hgetall('users', function (err, users) {
      console.dir(users)
      cb(users)
    })
  }

  for (opt in opts) {
    self[opt] = opts[opt]
  }

}

module.exports = new Users()

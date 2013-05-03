var redis = require('redis')
, async = require('async')
, client = redis.createClient()

var users = [ // prototype user model
  { name:'default',
  host:'localhost',
  modules:['data']}, 
  { name:'blacksea',
  host:'theblacksea.cc',
  modules:['data']},
  { name:'waffles',
  host:'waffles.cc',
  modules:['data']}
]

async.forEach(users, function (user, cb) {
  client.hset('users', user.name, JSON.stringify(user), function (err) {
    if (err) throw err
    cb()
  })
}, function () {
  console.log('users added')
})

module.exports = function () {
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

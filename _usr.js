var redis = require('redis')
, async = require('async')
, client = redis.createClient()

var users = [ // user model
  { name:'default',
  host:'localhost',
  modules:['data','test'],
  conns:[{1367804262251:'test>data'},{1367804270001:'data>brico'}]},
  { name:'blacksea',
  host:'theblacksea.cc',
  modules:['data']},
  { name:'waffles',
  host:'waffles.cc',
  modules:['data','test']}
]
// or make conns like : [{timestampID:modA>modB}, ..etc]
// how to handle client/server connections?
// make sure user has modules + conns avail. -- warn if conn's not avail or if wrong mods
// should there be seperate conns for bus in or out

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

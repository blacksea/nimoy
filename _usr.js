var redis = require('redis')
, async = require('async')
, client = redis.createClient()
, fs = require('fs')

var users = [ // user model
  {
  name:'default',
  host:'localhost',
  modules: {
    client:['console'],
    server:['data','test']
  },
  conns:{
    client:[   
      {1367804262258:'console>bus'},
      {1367804262250:'bus>console'}
    ],
    server:[
      {1367804262251:'test>data'},
      {1367804262259:'bus>test'},
      {1367804262252:'data>bus'}
    ]
  }},

  {
  name:'blacksea',
  host:'theblacksea.cc',
  modules: {
    client:['console'],
    server:['data','test']
  }},

  {
  name:'waffles',
  host:'waffles.cc',
  modules: {
    client:['console'],
    server:['data','test']
  }}
]

async.forEach(users, function (user, cb) {
  client.hset('users', user.name, JSON.stringify(user), function (err) {
    if (err) throw err
    cb()
  })
}, function () {
  console.log('users added')
  fs.writeFile('./_info/users.json', JSON.stringify(users,null,2), function (err) {
    if (!err) console.log('wrote users.json')
  })
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

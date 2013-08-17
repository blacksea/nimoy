var redis = require('redis')
, asyncMap = require('slide').asyncMap
, client = redis.createClient()
, fs = require('fs')

var users = [ // user model
  {
  name:'default',
  host:'blacksea.local',
  modules: {
    client:['console','mdisp'],
    server:['data','test']
  },
  conns:{
    client:[   
      {1367804262258:'console>bus'},
      {1367804262250:'bus>mdisp'}
    ],
    server:[
      {1367804262251:'test>data'},
      {1367804262259:'bus>test'},
      {1367804262252:'data>bus'}
    ]
  }},
 {
  name:'raspberry',
  host:'pak.local',
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
  }}
]

asyncMap(users, function (user, cb) {
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

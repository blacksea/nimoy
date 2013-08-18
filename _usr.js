var asyncMap = require('slide').asyncMap
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

module.exports = function () {
  var self = this

  this.buildUsers = function (cb) {
    asyncMap(users, function (usr, next) {
      cb(usr)
      next()
    }, function () {
      console.log('users added')
    })
  }
}

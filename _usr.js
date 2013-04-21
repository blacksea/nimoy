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
      file:"./_wilds/_bundle.js"},
      {url:"/_styles.css",
      file:"./_wilds/_styles.css"}
    ],
    modules:['data']
  }

}

module.exports = new Users()

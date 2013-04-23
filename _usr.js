var redis = require('redis'),
client = redis.createClient()

var defaultUser = { // default user object
  name:'default',
  domain:'localhost',
  modules:['data']
}

module.exports = function () {
  
}

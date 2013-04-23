var redis = require('redis'),
client = redis.createClient()

var defaultUser = { // default user object
  name:'default',
  domain:'localhost',
  rts:[
    {url:"/",
    file:"./_wilds/_index.html"},
    {url:"/_bundle.min.js",
    file:"./_wilds/_bundle.js"},
    {url:"/_styles.css",
    file:"./_wilds/_styles.css"}
  ],
  modules:['data']
}

module.exports = defaultUser 

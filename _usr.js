// USER 

var redis = require('redis'),
client = redis.createClient();

module.exports = function (opts) {
  var self = this;

  if (!opts) {
    opts = { 
      name: 'default',
      domain:'http://127.0.0.1',
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
  }

  for (opt in opts) {
    self[opt] = opts[opt];
  }
}

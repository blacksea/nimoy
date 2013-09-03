// SERVER START SCRIPT
var Env = require('./_env').nodeEnv

var _env = new Env({
  port:80,
  wilds: './_wilds'
}, function EnvLoaded () {
  console.log('nimoy active!')
})

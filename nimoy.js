// SERVER START SCRIPT
var Env = require('./_env')
var _env = new Env({
  port:80,
  wilds: './_wilds'
})
_env.load(function environmentLoaded () {
  console.log('nimoy active!')
})

// NIMOY 
var Env = require('./_env_N')
var _env = new Env({
  wilds: './_wilds',
  port:80
})

var defaultUser = {
  name : 'default',
  host : 'localhost',
  connections: '',
  modules : ''
}
_env.addUser(defaultUser)

_env.load(function environmentLoaded () {
  console.log('nimoy active!')
})

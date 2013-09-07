// NIMOY 
var Env = require('./_env_N')

var defaultUser = {
  name : 'default',
  host : 'localhost',
  connections: '',
  modules : ''
}

var _env = new Env({
  wilds: './_wilds',
  port:80,
  db:'./data'
}, function serverRunning () {
  _env.addUser(defaultUser, function () {
    _env.load(function environmentLoaded () {
      console.log('nimoy active!')
    })
  })
})

// BROWSER ENVIRONMENT 
var Env = require('./_env.js').browserEnv

var _env = new Env({
  
}, function () {
  console.log('created a new environment')
})

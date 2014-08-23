// quickstart wrapper for nimoy!

var nimoy = require('./_nimoy')
var configFlag = process.argv[2] 

var conf = !(configFlag) 
  ? require('./config.json')
  : require(process.argv[2])

nimoy.compile(conf, function (lib) {
  require('fs').writeFileSync(conf.path_static+'/library.json')
  console.log('wrote lib to '+conf.path_static+'/library.json')
})

nimoy.boot(conf, function () {
  console.log('Nimoy running on p: '+conf.port+' h: '+conf.host)
})


// quickstart wrapper for nimoy!

var nimoy = require('./nimoy')
var configFlag = process.argv[2] 

var n = !(configFlag) 
  ? nimoy(require('./config.json'))
  : nimoy(require(process.argv[2]))

n.compile().boot()

n.on('boot', function () {
  console.log('nimoy running!')
})

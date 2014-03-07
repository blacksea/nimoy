var test = require('tape')
var exec = require('child_process').exec

exec('cd ../ && node nimoy', function (e, stdout, stderr) {
  if (e) console.error(e)
  if (stdout) console.log(stdout)
  if (stderr) console.error(stderr)
})

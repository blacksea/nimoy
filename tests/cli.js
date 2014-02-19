var cli = require('../_cli')

process.stdin.pipe(cli()).pipe(process.stdout)

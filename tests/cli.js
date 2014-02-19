var cli = require('../_cli')

process.stdin.pipe(repl()).pipe(process.stdout)

var repl = require('../_repl')

process.stdin.pipe(repl()).pipe(process.stdout)

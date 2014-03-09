if (modules[0].process !== modules[1].process) {

  for (var i=0;i<modules.length;i++) {
    var m = modules[i]

    if (proc.browser && m.process == 'browser') {
      var mod = _[m.uid]
      m.pos = i
      mxdx.on('connection', function (s) {
        if (stream.meta===uid) {
          m.pos === 0
            ? mod.pipe(s)
            : s.pipe(mod)
        }
      }) 
    }

    if (proc.node && m.process === 'node') {
      var mod = _[m.uid]
      var s = mxdx.createStream(uid)
      m.pos === '0'
        ? mod.pipe(s)
        : s.pipe(mod)
    }
  }

} else if (proc[modules[0].process]) {
  _[d.value[0]].pipe(_[d.value[1]])
}

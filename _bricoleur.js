var interface = require('./_interface')
var through = require('through')

module.exports = function Bricoleur (multiLevel, opts) { 

  //  process sets tools
  var self = this
  var MuxDemux
  var Wilds = {}
  var _ // duplex stream returned on Bricoleur()


  interface.pipe(multiLevel.createWriteStream()) // patch api into db
  interface.on('error', handleErrors)

  // multiLevel.liveStream({ reverse:true })
  //   .on('data', signalWilds)


  function signalWilds (d) {

    if (!d.type) d.type = 'put' // only applies to old 

    d.key = d.key.split(':')

    var signal = d.key[0]

    switch (signal) {

      case '^' : packages = d.value; break; // library

      case '!' : ; break; // process

      case '*' : makeUnmake(d); break;

      case '|' : pipeUnpipe(d); break;

      case '#' : break; // module data

      case '_' : break; // 

      default : error({}); break;

    }

  }


  function makeUnmake (d) {

    d.value
      ? Wilds[modName] = require(opts.wilds+name)(d.value) 
      : Wilds[modName] = require(opts.wilds+name)

    Wilds[modName].id = modName

    // _.emit('data', {
    //   status:
    //   body:
    //   type:
    // })

  }


  function pipeUnpipe (d) {

    mods.map(function getPkgs (uid, i, a) {
      var name = uid.split('_')[0]
      var pkg = index[name].nimoy
      pkg.uid = uid
      pkg.pos = i
      a[i] = pkg
    })

    var s = self.muxDemux.createStream(conn)
              
    Wilds[mods[0].uid].pipe(Wilds[mods[1].uid])

    m.pos === 0
      ? Wilds[m.uid].pipe(s)
      : s.pipe(Wilds[m.uid])

    // _.emit('data', {
    //   status:
    //   body:
    //   type:
    // })

  }


  function muxPipe (soc) {
    // make stream module
    // call pipeUnpipe
    if (s.meta === hotModule.conn) {
     (hotModule.pos === 0)
       ? _[hotModule.uid].pipe(s)
       : s.pipe(_[hotModule.uid])
    }
  }


  function error (e) {
    // inherit from e
    var err = new Error(e.msg)
    err.code = e.code
    _.emit('error', err)
  }


  function handleErrors (e) { // todo
    console.error(e) 
  }


  _ = through(function Write () {
    this.emit('data')
  }, function End () {
    this.emit('end')
  })

  _.installMuxDemux = function (mxdx) {
    muxDemux = mxdx
    if (proc === 'browser') muxDemux.on('connection', muxPipe)
  }

  _.write = interface.write.bind(interface)
  
  _.wilds = Wilds

  return _

} 

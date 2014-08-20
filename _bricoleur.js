var _ = require('underscore')
var cuid = require('cuid') // 25 char uid
var through = require('through2')
var hmac = require('crypto-browserify/create-hmac')
var Buffer = require('buffer/').Buffer
// var IMG = new Buffer(config.uImg).toString()

module.exports = function Bricoleur (db, user, config) { 

  var canvas = {} // canvas is just an object with cuid hash keys

  var s = through.obj(function interface (d, enc, next) {
    var self = this

    if (d instanceof Array) { 
      d.forEach(function (str) {
        parseCommand(str, handleResult)
      })
    } else parseCommand(d, handleResult)

    function handleResult (e, res) {
      if (!e) { self.push(res) } else { self.emit('error', e) }
      next()
    }
  })

  function parseCommand (d, cb) { 
    var str = (typeof d === 'string') ? d : d.key

    // parse!
    var action = str[0].match(/\+|\-|\?/)[0]
    var type = str.slice(1).match(/\@|\#|\$|\|/) 
    type = (!type) ? '*' : type[0] 
    var actor = (type==='*') ? str.slice(1) : (type==='|') 
      ? str.slice(1).split('|') : str.slice(2)

    if (!action||!type||!actor) // fail!
      { cb(new Error('wrong cmd:'+str), null); return false }

    // process!
    var id = cuid() // make an id

    if (action==='?') { // handle ? first
      // check exists
      db.get(key, cb)
    }

    if (type==='|') { // PIPE
      var modA = actor[0]
      var modB = actor[1]

      // +
      if (action==='+') modA.pipe(modB)

      // -
      if (action==='-') modA.unpipe(modB)
      canvas[id] = 'action'
      cb(id)
    } 
    if (type==='*') { // MODULE
      // + 
      canvas[id] = require(actor)
      // -
      //find actor --- remove stream?
      delete canvas[id]
    }
    if (type==='$' || type==='#') { // DATA
      // +
      db.put(key, d.value, cb)
      // -
      db.del(key, cb)
    }
    if (type==='@') { // USER
      // look at auth mech agin
      var pass = (checkUid(cmd[1])) ? cmd[1] : getAuthToken(cmd[1])
      db.auth({name:cmd[0].slice(1), pass: pass}, cb)
      db.deauth(function (e) { if (e) handleErr(e) })
    }

    cb(null, [action, type, actor]) // default result is a cuid
  }

  function levelDBsync (d) { 

  }

  db.liveStream({reverse : true})
    .on('data', levelDBsync)

  return s
} 

function getAuthToken (pass) {
  return hmac('sha256', IMG).update(pass).digest('hex')
}

function checkUid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]===0) ? true : false
  return r
}

function handleError (e) { console.error(e) }

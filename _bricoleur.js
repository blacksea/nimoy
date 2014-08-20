var _ = require('underscore')
var cuid = require('cuid') // 25 char uid
var through = require('through2')
var hmac = require('crypto-browserify/create-hmac')

module.exports = function Bricoleur (db, user, config) { 
  var canvas = {}
  var commands = {}


  var s = through.obj(function interface (d, enc, next) {
    // process input
    // determin db calls
    // check for an obj w value & load
    
    if (d instanceof Array) { d.forEach(parseCommand); next(); return false }

    else if (typeof d !== 'string') { 
      console.log(typeof d)
      next()
      return false
    }

    parseCommand(d)

    next()
  })

  function parseCommand (cmd) { // try to call other commands first
    if (cmd.split(' ')) {
      var action = cmd.split(' ')
    }

    // then do canvas actions
    var action = cmd.match(/\+|\-/)

    if (!action) return false

    var id = cuid() // make an id

    if (action.index > 0) { // combine / pipe
      var modA = cmd.split(action[0])[0]
      var modB = cmd.split(action[0])[1]
      if (action[0]==='+') modA.pipe(modB)
      if (action[0]==='-') modA.unpipe(modB)
      canvas[id] = 'action'
    } else { // module action
      var mod = action.input.slice(0)
      if (action[0]==='+') { // add module

      }
      if (action[0]==='-') { // rm module

      }
      if (action[0]==='@') { // auth db and get id 

      }
    }
  }

  function levelDBsync (d) { }

  db.liveStream({reverse : true})
    .on('data', levelDBsync)

  commands.auth = function (d, next) { // integrate w session
    if (!d.value.session || !d.value.name) { 
      next(err('bad format '+ JSON.stringify(d), null))
      return null
    }
    db.auth(d.value, next)
  }

  return s
} 

function handleError (e) { console.error(e) }

function checkUid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]===0) ? true : false 
  return r
}

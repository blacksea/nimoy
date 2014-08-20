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
        parseCommand(str, function (e, res) {
          if (!e) { self.push(res) } else { self.emit('error', e) }
          next()
        })
      })
    } else { 
      parseCommand(d, function (e, res) {
        if (!e) { self.push(res) } else { self.emit('error', e) }
        next()
      })
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
      { cb(new Error('wrong cmd:'+str), null) ;return false }

    // process!
    
    cb(null, [action, type, actor])

    var id = cuid() // make an id

    if (action.index > 0) { // combine / pipe
      var modA = cmd.split(action[0])[0]
      var modB = cmd.split(action[0])[1]
      if (action[0]==='+') modA.pipe(modB)
      if (action[0]==='-') modA.unpipe(modB)
       
      canvas[id] = 'action'
    } else { 
      var mod = action.input.slice(0)
      if (action[0]==='+') { // add module 

      }
      if (action[0]==='-') { // rm module

      }
      if (action[0]==='@') { // auth
        var pass = (checkUid(cmd[1])) ? cmd[1] : getAuthToken(cmd[1])
        db.auth({name:cmd[0].slice(1), pass: pass}, cb)
        db.deauth(function (e) {if (e) handleErr(e) })
      }
      if (action[0]==='#') { // rm module

      }
    }

  }

  function levelDBsync (d) { }

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

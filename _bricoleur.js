var _ = require('underscore')
var cuid = require('cuid') // 25 char uid
var through = require('through2')
var hash = require('crypto-browserify/create-hash')

module.exports = function Bricoleur (db, user, library) { 

  var canvas = {} 

  var s = through.obj(function interface (d, enc, next) {
    var self = this

    if (d instanceof Array) { 
      d.forEach(function (str) {
        parseCommand(str, handleResult)
      })
    } else parseCommand(d, handleResult)

    function handleResult (e, res) { // return to sender
      console.log(res)
      if (!e) { self.push(res) } else { self.emit('error', e) }
      next()
    }
  })

  function parseCommand (d, cb) { 
    var str = (typeof d === 'string') ? d : d.key

    var action = str[0].match(/\+|\-|\?/)[0]
    var type = str.slice(1).match(/\@|\#|\$|\|/) 
    type = (!type) ? '*' : type[0] 
    var actor = (type==='*') ? str.slice(1) : (type==='|') 
      ? str.slice(1).split('|') : str.slice(2)

    if (!action||!type||!actor) { 
      cb(new Error('wrong cmd:'+str), null); return false
    }

    // SYMBOLS 
    // ACTIONS: ? get/find, + add, - rm  
    // TYPES: * modules, @ users, # canvas, $ data, | pipes

    if (action==='?') { 

      if (type==='*') {
        var pkg = _.find(library, function (v,k) {if (k.match(actor)) return v})
        var uid = _.find(canvas, function (v,k) {
          if (k.match(actor)) 
          return k.split(':')[1]
        })
        cb(null, [pkg,uid])
        return false
      }

      if (type==='#' || type==='$') {
        var res
        var s = db.createKeyStream()
        s.on('data', function (k) {
          if (k.match(actor)) {
            res = k
          }
        })
        s.on('end', function () {
          if (res) cb(null, res)
          if (!res) cb(new Error('not found: '+actor), null)
        })
      }
    }
    

    if (type==='|') { 
      var id = cuid()
      var modA = actor[0]
      var modB = actor[1]

      if (action==='+') modA.pipe(modB)

      if (action==='-') modA.unpipe(modB)

      canvas[id] = 'action'
      cb(id)
    } 


    if (type==='*') {

      if (action==='-') {
        if (!canvas[actor]) cb(new Error('no module: '+actor),null)
          else  { delete canvas[actor]; cb(null, actor) }
        return false
      }

      if (action==='+') {
        var id = (!actor.match(':')) ? cuid() : actor.split(':')[1]
        var modName = (!actor.match(':')) ? actor : actor.split(':')[0]
        var pkg = _.find(library,function(v,k) {if (k.match(modName)) return v})
        if (!pkg) {
          cb(new Error('module: '+modName+' not found!'), null); return false  
        }
        canvas[id] = require(pkg.name)(id)
        cb(null, id)
      }
    }


    if (type==='$' || type==='#') { 
      var key = type+actor
      if (action==='+') db.put(key, d.value, cb)
      if (action==='-') db.del(key, cb)
    }


    if (type==='@') { 

      if (action==='-') {
        db.deauth(cb)
        return false
      }
      var auth = actor.split(' ')
      if (!auth) {cb(new Error('bad login'),null); return false}
      var user = { name: auth[0] }
      user.pass = (isCuid(auth[1])) 
        ? auth[1]
        : getAuthToken(auth[1])

      if (action==='+') db.auth(user, cb)
    }
  }

  function sync (d) { 

  }

  db.liveStream({reverse : true})
    .on('data', sync)

  return s
} 

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]===0) ? true : false
  return r
}

function getAuthToken (pass) {return hash('sha256').update(pass).digest('hex')}

function handleError (e) {console.error(e)}

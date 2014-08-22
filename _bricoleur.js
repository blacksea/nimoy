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

    function handleResult (e, res) { 
      if (res) {
        if (d.from) res.key += ':'+d.from
        self.push(res)
      }
      if (e) self.emit('error', e)
      next()
    }
  })

  function parseCommand (d, cb) { 
    var str = (typeof d === 'string') ? d : d.cmd
    if (!str) { cb(new Error('bad input!'), null); return false }
    var action = str[0].match(/\+|\-|\?|\!/)[0]
    var type = str.slice(1).match(/\@|\#|\$|\||\*/)
    type = (type!==null) ? type[0] : isCuid(str.slice(1)) ? '^' : '*'

    var actor = (type==='^'||str.slice(1)[0]) ? str.slice(1):(type==='|') 
      ? str.slice(1).split('|') : str.slice(2)

    console.log(str)

    if (!action||!type||!actor) { 
      cb(new Error('wrong cmd:'+str), null); return false
    }

    var res = {}
    res.key = (type==='|') ? type : type+':'+actor 

    // SYMBOLS 
    // ACTIONS: ? get/find, + add, - rm , ! open 
    // TYPES: * modules, @ users, # canvas, $ data, | pipes, ^ cuid
    
    if (action==='?') { // add support for an array of matches & deeper search
      if (type==='*') {
        var pkg = _.find(library, function (v,k) {if (k.match(actor)) return v})
        var uid = _.find(canvas, function (v,k) {
          if (k.match(actor)) return k.split(':')[1]
        })
        res.value = [pkg,uid] 
        cb(null, res)
        return false
      }
      if (type==='#' || type==='$') {
        db.createKeyStream()
          .on('data', function (k) {
            res.value = k
            if (k.match(actor)) cb(null, res)
          })
      }
    }

    if (action==='!'&&type==='#') {
      db.get(type+':'+actor, function (e, jsn) {
        var cvs = JSON.parse(jsn)
        res.value = type+':'+actor
        var last = cvs[cvs.length-1]
        _.each(cvs, function (cmd) {
          parseCommand(cmd, function (e, r) {
            if (e) cb(e, null) // failed! \ check for last result
            if (cmd===last) cb(null, res) // success!
          })
        })
      })
    }

    if (type==='^') { // cuid
      if (action==='-') {
        if (!canvas[actor]) {
          cb(new Error(actor + ' not found'),null)
          return false
        }
        delete canvas[actor] 
        res.value = actor
        cb(null, res) 
        return false
      }
    }

    if (type==='|') { 
      var modA = _.find(canvas,function (v,k) {return k.match(actor[0])})
      var modB = _.find(canvas,function (v,k) {return k.match(actor[1])})

      if (!modA || !modB) {
        cb(new Error('unpipeable'+actor,null)) 
        return false
      }

      if (action==='+') {
        var id = cuid()
        modA.pipe(modB)
        canvas[id] = actor
        res.value = id
        cb(null, res)
        return false
      }

      if (action==='-') {
        var modAcuid = canvas[actor[0]]
        var modBcuid = canvas[actor[1]]
        var rs = canvas[modAcuid]
        var ws = canvas[modBcuid]
        rs.destroy()
        rs.unpipe(ws)
      }
    } 

    if (type==='*') {

      if (action==='-') {
        res.value = actor
        if (!canvas[actor]) cb(new Error('no module: '+actor),null)
          else  { delete canvas[actor]; cb(null, res) }
        return false
      }

      if (action==='+') {
        var id = (!actor.match(':')) ? cuid() : actor.split(':')[1]
        var modName = (!actor.match(':')) ? actor : actor.split(':')[0]
        var pkg = _.find(library,function(v,k) {if (k.match(modName)) return v})
        if (!pkg) {
          cb(new Error('module: '+modName+' not found!'), null); return false  
        }
        // key is a command format
        canvas[id] = require(pkg.name)(id)
        canvas[id].name = modName
        res.value = id
        cb(null, res)
      }
    }

    if (type==='$' || type==='#') { 
      // look for cuid
      var key = type+':'+actor
      res.value = key
      if (action==='+') {
        var val
        if (type==='#') {
          cmds = []
          _.each(canvas, function (v,k) {
            var t = (v instanceof Array) ? '|' : '*'
            var a = (t==='|') ? v.join('|') : v.name+':'+k
            cmds.push('+'+t+a)
          })
          val = JSON.stringify(cmds)
        } else val = d.value
        db.put(key, val, function (e) {
          if (e) cb (e, null)
          if (!e) cb(null, res)
        })
      }
      if (action==='-') db.del(key, function (e) {
        if (e) cb (e, null)
        if (!e) cb(null, res)
      })
    }

    if (type==='@') { 
      if (action==='-') {
        res.value = actor
        db.deauth(function (e) {cb(null, res)})
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

  function isCuid (id) {
    var r = (typeof id==='string' && id.length===25 && id[0]==='c') ? true : false
    return r
  }

  function getAuthToken (pass) {
    return hash('sha256').update(pass).digest('hex')
  }

  function handleError (e) {
    console.error(e)
  }

  return s
} 

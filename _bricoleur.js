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
    var action = str[0].match(/\+|\-|\?/)[0]
    var type = str.slice(1).match(/\@|\#|\$|\|/);
    type = (type!==null) ? type[0] : isCuid(str.slice(1)) ? '!' : '*'

    var actor = (type==='!'||type==='*') ? str.slice(1) : (type==='|') 
      ? str.slice(1).split('|') : str.slice(2)

    if (!action||!type||!actor) { 
      cb(new Error('wrong cmd:'+str), null); return false
    }
    var res = {key:type+':'+actor}

    // SYMBOLS 
    // ACTIONS: ? get/find, + add, - rm  
    // TYPES: * modules, @ users, # canvas, $ data, | pipes

    if (action==='?') { // should also allow for multiple results
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


    if (type==='!') { // cuid
      if (action==='-') {
        var key = _.find(canvas, function (v,k) {if (k.match(actor)) return k})
        res.value = key
        if (key && canvas[key]) { delete canvas[key]; cb(null, res) }
        else cb(new Error(actor+' not found'), null)
      }
    }


    if (type==='|') { 
      console.log(actor)
      if (isCuid(actor[0])===false || isCuid(actor[1])===false) {
        cb(new Error('unpipeable',null))
      } else {
        // check if cuid!
        var modA = _.find(canvas,function (v,k) {if(k.match(actor[0])) return v})
        var modB = _.find(canvas,function (v,k) {if(k.match(actor[1])) return v})

        if (action==='+') {
          var id = cuid()
          modA.pipe(modB)
          canvas[id] = 'action'
          res.value = id
          cb(null, res)
        }

        if (action==='-') {
          var modA = canvas[actor][0]
          var modB = canvas[actor][0]
          modA.unpipe(modB)
          delete canvas[actor]
          res.value = actor
          cb(null, res)
        }
      }
    } 


    if (type==='*') {

      if (action==='-') {
        res.value = actor
        if (!canvas[actor]) cb(new Error('no module: '+actor),null)
          else  { delete canvas[actor]; cb(null, res)
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
        res.value = id
        cb(null, res)
      }
    }


    if (type==='$' || type==='#') { 
      var key = type+actor
      res.value = key
      if (action==='+') db.put(key, d.value, function (e) {
        if (e) cb (e, null)
        if (!e) cb(null, res)
      })
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

  return s
} 

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') ? true : false
  return r
}

function getAuthToken (pass) {return hash('sha256').update(pass).digest('hex')}

function handleError (e) {console.error(e)}

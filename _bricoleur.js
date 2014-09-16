var _ = require('underscore')
var cuid = require('cuid')
var through = require('through2')
var hash = require('crypto-browserify/create-hash')

module.exports = function Bricoleur (db, library) { 
  // provide a way to hook into api stream -- through the mL mux?
  var canvas = {} 
  var ID = cuid()

  var s = through.obj(function interface (d, enc, next) {
    var self = this

    if (d instanceof Array) { 
      d.forEach(function (str) {
        parseCommand(str, handleResult)
      })
    } else parseCommand(d, handleResult)

    function handleResult (e, res) { 
      if (res && res.parcel) {
        if (!res.key) res.key = res.parcel
        else res.key += (':'+res.parcel)
        delete res.parcel
      }
      var response = (e) ? e : res // arrg!
      self.push(response)
    }

    next()
  })

  canvas[ID] = s 
  canvas[ID].name = 'bricoleur'

  function parseCommand (d, cb) { 
    var res = {}
    
    var str = (typeof d === 'string') ? d : (!d.cmd) ? null : d.cmd // .cmd sucks!
    if (!str) { cb(new Error('bad input!'), null); return false }

    var parcel = (str.split(':').length > 1) ? str.split(':')[1] : null
    if (parcel) {
      res.parcel = parcel
      str = str.split(':')[0] // scrub parcel from actor
    }

    var action = str[0].match(/\+|\-|\?|\!/)[0]
    var type = str.slice(1).match(/\@|\#|\$|\||\*/)

    type = (type !== null) ? type[0] : isCuid(str.slice(1)) ? '^' : '*'

    var actor = (type === '^') ? str.slice(1) : (type === '|') 
      ? str.slice(1).split('|') : (type === '*' && str[1] !== '*') 
      ? str.slice(1) : str.slice(2)



    if (!action||!type||!actor) { 
      cb(new Error('wrong cmd:'+str), null); return false
    }

    // SYMBOLS 
    // ACTIONS: ? get/find, + add, - rm , ! open 
    // TYPES: * modules, @ users, # canvas, $ data, | pipes, ^ cuid
    
    if (action==='?') { // improve w. multiple results / deeper search
      if (type==='*') {
        var pkg = _.find(library, function (v,k) {if(k.match(actor)) return v})
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
        if (e) { cb(e, null); return false }
        var cvs = JSON.parse(jsn)
        res.value = type+':'+actor
        var last = cvs[cvs.length-1]
        _.each(_.keys(canvas).reverse(), function (k) {
          if (canvas[k].name!=='bricoleur') 
            parseCommand('-'+k, function (e,res) {
              if (e) cb(e, null)
            })
        })
        _.each(cvs, function (cmd) {
          parseCommand(cmd, function (e, r) {
            if (e) {cb(e, null)}
            if (!e && cmd===last) {
              cb(null, res)
            }
          })
        })
      })
    }

    if (type==='^') {
      if (action==='-') {
        if (!canvas[actor]) {
          cb(new Error(actor + ' not found'),null)
          return false
        }
        if (canvas[actor] instanceof Array) {
          var val = canvas[actor]
          var rs = canvas[val[0]]
          var ws = canvas[val[1]]
          rs.destroy()
          rs.unpipe(ws)
          delete canvas[actor] 
        } else delete canvas[actor]
        res.value = actor
        cb(null, res) 
        return false
      }
    }

    if (type==='|') { 
      var id = cuid()

      // remove cuid here---always generate---pipe role could be improved
      if (actor[1].split(':').length>1) {
        id = actor[1].split(':')[1]
        actor[1] = actor[1].split(':')[0]
      }

      for (var i=0;i<actor.length;i++) {
        actor[i] = (isCuid(actor[i]))
          ? actor[i] 
          : nameToCuid(actor[i])
      }

      if (!canvas[actor[0]] || !canvas[actor[1]]) {
        cb(new Error('unpipeable'+actor,null)) 
        return false
      }

      if (action==='+') {
        canvas[actor[0]].pipe(canvas[actor[1]])
        canvas[id] = actor
        res.value = id
        cb(null, res)
        return false
      }

      if (action==='-') {
        // make sure stream has a destroy method!
        canvas[actor[0]].destroy()
        canvas[actor[0]].unpipe(canvas[actor[1]])
        res.value = pipeToCuid(actor)
        delete canvas[res.value]
        cb(null, res)
      }
    } 

    if (type==='*') {
      if (action==='-') {
        actor = (!isCuid(actor)) ? nameToCuid(actor) : actor
        res.value = actor
        if (!canvas[actor]) cb(new Error('no module: '+actor), null)
        else  { canvas[actor].destroy() ;delete canvas[actor]; cb(null, res) }
        return false
      }
      if (action==='+') {
        var modCuid = actor.split(':')[1] //!!!!
        var id = (!modCuid) ? cuid() : modCuid
        var modName = (!modCuid) ? actor : actor.split(':')[0]
        var opts = {id: id}
        res.value = id

        var pkg = _.find(library, function(v,k){if(k.match(modName))return v})
        if (!pkg) {
          if (modName === 'bricoleur') { 
            canvas[id] = s; 
            cb(null,res)
            return false 
          } else {
            cb(new Error('module: '+modName+' not found!'), null) 
            return false  
          }
        } 
        if (!modCuid) {
          canvas[id] = require(pkg.name)(opts) // find a way to hook in opts
          canvas[id].name = modName
          cb(null, res)
          return false
        }
        if (modCuid && pkg.data) {
          db.get('$:'+modCuid, function (e, mData) {
            if (e) { opts.data = pkg.data }
            if (!e) opts.data = mData
            canvas[id] = require(pkg.name)(opts)
            canvas[id].name = modName
            cb(null, res)
          })
        } else if (modCuid && !pkg.data) {
          canvas[id] = require(pkg.name)(opts)
          canvas[id].name = modName
          cb(null, res)
        }
      }
    }

    if (type==='$' || type==='#') { 
      var key = type+':'+actor
      res.value = key
      if (action==='+') {
        var val
        if (type==='#') {
          cmds = []
          _.each(_.keys(canvas), function (k) {
            var v = canvas[k]
            var t = (v instanceof Array) ? '|' : '*'
            var c = (t==='|') ? v.join('|')+':'+k : t+canvas[k].name+':'+k
            cmds.push('+'+c)
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

  function sync (d) { // use this!

  }

  db.liveStream({reverse : true})
    .on('data', sync)

  function isCuid (id) {
    var r = (typeof id==='string' && id.length===25 && id[0]==='c') 
      ? true : false
    return r
  }

  function nameToCuid (name) {
     return _.find(_.keys(canvas),function(k){
            return canvas[k].name === name
     })
  }
  function pipeToCuid (pipe) {
    return _.find(_.keys(canvas),function(k){
          return canvas[k].toString() === pipe.toString()
   })
  }

  function getAuthToken (pass) {
    return hash('sha256').update(pass).digest('hex')
  }

  return s
}

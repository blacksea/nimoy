var _ = require('underscore')
var through = require('through2')
var muxDemux = require('mux-demux')
var cuid = require('cuid')
var createHash = require('crypto-browserify/create-hash')

// push out current canvas state -- only ... what about stream objects
// brico tracks canvas and emits changes to canvas!
// be careful with match + regex! do some filtering beforehand!

module.exports = function Bricoleur (db, library) {
  var canvas = {} 
  var ID = cuid()
  var syncCache = {}

  function sync (d) { 
    if (d.key === 'library') library = JSON.parse(d)
    var id = d.key.split('$:')[1]
    if (id && d.value && typeof d.value === 'string') 
      d.value = JSON.parse(d.value)
    if (canvas[id] && canvas[id].$) {
      canvas[id].$.push(d.value)
    }
  }

  var dbMuxDemux = muxDemux(function (st) {
    var key = '$:'+st.meta
    syncCache[st.meta] = ID
    st.on('data', function put (val) { db.put(key,JSON.stringify(val)) })
  })
  var moduleDataMuxDemux = muxDemux()
  moduleDataMuxDemux.pipe(dbMuxDemux)

  // emit a shorthand efficient new canvas state obj when command completes!

  var s = through.obj(function interface (d, enc, next) {
    var self = this

    if (d instanceof Array) { 
      d.forEach(function (str) {
        parseCommand(str, handleResult)
      })
    } else parseCommand(d, handleResult)

    function handleResult (e, res) { 
      if (res && res.parcel) {
        if (res.key) res.key += ':'+res.parcel
        if (!res.key) res.key = res.parcel
        delete res.parcel
      }
      var response = (!e) ? res : e
      self.push(response)
      next() 
    }
  })

  canvas[ID] = s 
  canvas[ID].name = 'bricoleur'

  function compressCanvas () {
    var c = {}
    _.each(canvas, function (v,k) {
      if (v instanceof Array) {
        c[k] = v
      } else if (typeof v === 'object') {
        if (v.name && v.name !== 'bricoleur') {
          c[k] = {id : k}
          if (v.name) c[k].name = v.name
          if (!v.pipe) {
            for (prop in v) {
              if (!v[prop].pipe) c[k][prop] = v[prop]
            }
          }
        }
      }
    })
    return c
  }


  function parseCommand (d, cb) { 
    var str
    var data
    var res = {}

    if (typeof d === 'object' && d.key && d.value) {
      str = d.key 
      data = d.value
    } else if (typeof d === 'string') { 
      str = d
    } else str = null

    if (!str) { cb(new Error('bad input!'), null); return false }

    var parcel = (str.split('/').length > 1) ? str.split('/')[1] : null
    if (parcel) { res.parcel = parcel ; str = str.split('/')[0] }

    var action = str[0].match(/\+|\-|\?|\!/)
    if (!action) return false
    action = action[0]

    var type = str.slice(1).match(/\@|\#|\$|\||\_|\*/)
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
    

    if (action==='?') { 
      if (type==='*') {
        var pkg = _.find(library, function (v,k) {if(k.match(actor)) return v})

        var uid = _.find(canvas, function (v,k) {
          if (k.match(actor)) return k.split(':')[1]
        })
        res.value = [pkg,uid] 
        cb(null, res)
        return false
      }

      if (type==='#'||type==='$') {
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

        // res.value = type+':'+actor
         res.value = compressCanvas()
        
        var last = cvs[cvs.length-1]
        _.each(_.keys(canvas).reverse(), function (k) {
          if (canvas[k].name !== 'bricoleur')  
            parseCommand('-'+k, function (e,r) {
              if (e) cb(e, null)
            })
        })
        if (cvs.length===0) { cb(null, res); return false }
        _.each(cvs, function (cmd) { 
          parseCommand(cmd, function (e, r) {
            if (e) {cb(e, null)}
            if (!e && cmd===last) {
              res.value = compressCanvas()
              cb(null, res)
            }
          })
        })
      })
    }

    if (type==='_') {
      if (action==='+') {
        var cvs = compressCanvas()
        var macro = _.map(_.values(cvs), function (v) {
          return '+'+v.name
        })
        db.put('_:'+actor, macro, function (e) {
          if (!e) cb(null,res)
          if (e) cb(e,null)
        })
      } else if (action==='-') {
        db.del('_:'+actor,function (e) {
          if (!e) cb(null,res)
          if (e) cb(e,null)
        })
      }
    }

    if (type==='^') {
      if (action==='-') {
        if (!canvas[actor]) {
          cb(new Error(actor + ' not found'),null)
          return false
        } else if (canvas[actor] instanceof Array) {
          var val = canvas[actor]
          var rs = canvas[val[0]]
          var ws = canvas[val[1]]

          // do not destroy bricoleur streams! -- but do unpipe!
          if (rs && rs.name==='bricoleur' || ws && ws.name==='bricoleur') {
            cb(null, res) 
            return false
          } 

          if (rs.$) {
            rs.$.destroy()
            rs.s.destroy()
            rs.s.unpipe(ws) 
          } else {
            rs.destroy()
            rs.unpipe(ws)
          }

          delete canvas[actor] 
        } else {
          if (canvas[actor].$) {
            canvas[actor].s.destroy()
            canvas[actor].$.destroy()
          }
          delete canvas[actor]
        }

        res.value = compressCanvas()
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

      var readable = (!canvas[actor[0]].$)?canvas[actor[0]]:canvas[actor[0]].s
      var writable = (!canvas[actor[1]].$)?canvas[actor[1]]:canvas[actor[1]].s

      if (action==='+') { // check canvas value for data binding
        readable.pipe(writable)
        canvas[id] = actor 
        res.value = compressCanvas()
        cb(null, res)
        return false
      }

      if (action==='-') { // do not destroy streams when unpiping!
        readable.unpipe(writable)

        var uid = pipeToCuid(actor)
        
        delete canvas[uid]
        res.value = compressCanvas()
        cb(null, res)
      }
    } 

    if (type==='*') {

      if (action==='-') {
        actor = (!isCuid(actor)) ? nameToCuid(actor) : actor

        if (!canvas[actor]) {
          cb(new Error('no module: '+actor), null)
          return false
        }
        if (canvas[actor].s && canvas[actor].s.pipe) { // destroy pipe!
          canvas[actor].s.destroy()
          canvas[actor].$.destroy()
          delete canvas[pipeFromPiped(actor)]
        } else if (canvas[actor].pipe) {
          canvas[actor].destroy()
          delete canvas[pipeFromPiped(actor)]
        }
        delete canvas[actor]
        res.value = compressCanvas()
        cb(null, res)
        return false
      }

      if (action==='+') {
        var uid = (actor.split(':').length>1) ? actor.split(':')[1] : cuid()
        var name = (actor.match(':')) ? actor.split(':')[0] : actor


        var pkg = _.find(library,function(v,k){if(k.match(name))return v})
        if (!pkg) {
          if (name === 'bricoleur') { 
            canvas[uid] = s 
            cb(null,res)
            return false 
          } else {
            // try to load group!
            db.get('_:'+actor, function (e,d) {
              if (!e) parseCommand(d, cb) // uhm!
              if (e) cb(new Error('module: ' + actor + ' not found!'), null) 
            })
          }
          return false  
        } 

        pkg.id = uid

        var mod = require(pkg.name)

        canvas[uid] = mod(moduleDataMuxDemux.createStream(uid))

        canvas[uid].name = pkg.name

        if (pkg.mask) canvas[uid].mask = pkg.mask // mask from canvas save!

        var $ = canvas[uid].$

        $.push(pkg)

        db.get('$:'+uid, function (e,val){ 
          if (typeof val === 'string') val = JSON.parse(val)
          if (!e) { $.push(val) }
          if (e && pkg.data) { $.push(pkg.data) } // use sample data
          res.value = compressCanvas()
          cb(null, res)  // silent fail if !val
        })
      }
    }

    if (type==='$' || type==='#') { 
      var key = type+':'+actor
      if (action==='+') {
        var val
        if (type==='#') {
          cmds = []
          _.each(_.keys(canvas), function (k) {
            var v = canvas[k]
            var mask
            var t = (v instanceof Array) ? '|' : '*'
            if (t==='|') v.forEach(function(m){if(canvas[m].mask)mask=true})
            if (t==='*') if (v.mask || v.name === 'bricoleur') mask = true
            var c = (t==='|') ? v.join('|')+':'+k : t+canvas[k].name+':'+k
            if (!mask) {cmds.push('+'+c)}
          })
          val = JSON.stringify(cmds)
        } else val = JSON.stringify(data)
        db.put(key, val, function (e) {
          if (e) cb (e, null)
          res.value = compressCanvas()
          if (!e) cb(null, res)
        })
      }
      if (action==='-') db.del(key, function (e) {
        if (e) cb (e, null)
        res.value = compressCanvas()
        if (!e) cb(null, res)
      })
    }

    if (type==='@') { 
      if (action==='-') {
        res.value = '-'+actor
        delete sessionStorage.edit
        db.deauth(function (e) {if (e) cb(e,null); else cb(null, res)})
        return null
      }
      var auth = actor.split(' ')
      if (!auth) {cb(new Error('bad login'),null); return false}
      var user = { name: auth[0] }
      user.pass = (isCuid(auth[1])) 
        ? auth[1]
        : getAuthToken(auth[1])

      if (parcel) user.parcel = parcel
      if (action==='+') db.auth(user, cb)
    }
  }

  db.liveStream({old:false})
    .on('data', sync)

  function isCuid (id) {
    var r = (typeof id==='string' && id.length===25 && id[0]==='c') 
      ? true : false
    return r
  }

  function nameToCuid (name) {
     return _.find(_.keys(canvas), function(k) {
       var uid = canvas[k].name.match(name)
       if (!uid) return null
       return uid
     })
  }

  function pipeFromPiped (piped) {
    var res
    var p = _.pairs(canvas)
    res = _.find(p,function (arr) {return _.contains(arr[1],piped)})
    if (res) return res[0]
    else return false
  }

  function pipeToCuid (pipe) {
    return _.find(_.keys(canvas), function (k) {
      return canvas[k].toString() === pipe.toString()
   })
  }

  function getAuthToken (pass) {
    return createHash('sha256').update(pass).digest('hex')
  }

  return s
}

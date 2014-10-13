var _ = require('underscore')
var cuid = require('cuid')
var through = require('through2')
var hash = require('crypto-browserify/create-hash')
var muxDemux = require('mux-demux')

module.exports = function Bricoleur (db, library) { 
  // need a good desc. of canvas -- whats in there!
  
  // put the canvas in leveldb !?

  var canvas = {} // maybe this should be in leveldb? // allow access!

  var ID = cuid()
  var syncCache = {}

  function sync (d) { 
    var id = d.key.split('$:')[1]
    if (id && canvas[id] && syncCache[id] !== ID) // not sure about this!
      canvas[id].$.push(JSON.parse(d.value)) // should be write!
  }

  // persistence for objects
  var dbMuxDemux = muxDemux(function (st) {
    var key = '$:'+st.meta
    syncCache[st.meta] = ID 
    st.on('data', function put (val) { db.put(key,JSON.stringify(val)) })
  })
  var moduleDataMuxDemux = muxDemux()

  moduleDataMuxDemux.pipe(dbMuxDemux)
  
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

  function parseCommand (d, cb) { 
    var res = {}

    var str = (typeof d === 'string') ? d : (!d.cmd) ? null : d.cmd 

    if (!str) { cb(new Error('bad input!'), null); return false }

    var parcel = (str.split(':').length > 1) ? str.split(':')[1] : null
    if (parcel) { res.parcel = parcel ; str = str.split(':')[0] }

    var action = str[0].match(/\+|\-|\?|\!/)
    if (!action) return false
    action = action[0]

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
        res.value = type+':'+actor // this glob res is probby
        var last = cvs[cvs.length-1]
        _.each(_.keys(canvas).reverse(), function (k) {
          if (canvas[k].name!=='bricoleur')  
            parseCommand('-'+k, function (e,r) {
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
        } else if (canvas[actor] instanceof Array) { // sometimes pipes 
          var val = canvas[actor]
          var rs = canvas[val[0]]
          var ws = canvas[val[1]]
          // do not destroy bricoleur streams! -- but do unpipe!
          if (rs&&rs.name==='bricoleur'||ws&&ws.name==='bricoleur') {
            // why is rs sometimes undefined!
            cb(null,res) 
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

      var readable =(!canvas[actor[0]].$)?canvas[actor[0]]:canvas[actor[0]].s
      var writable =(!canvas[actor[1]].$)?canvas[actor[1]]:canvas[actor[1]].s

      if (action==='+') { // check canvas value for data binding
        readable.pipe(writable)
        canvas[id] = actor 
        res.value = id
        cb(null, res)
        return false
      }

      if (action==='-') { // make sure stream has a destroy method!
        readable.destroy()
        readable.unpipe(writable)
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
        if (canvas[actor].s && canvas[actor].s.pipe) { // destroy pipe!
          canvas[actor].s.destroy()
          canvas[actor].$.destroy()
          delete canvas[pipeFromPiped(actor)]
        } else if (canvas[actor].pipe) {
          canvas[actor].destroy()
          delete canvas[pipeFromPiped(actor)]
        }
        delete canvas[actor]
        cb(null, res)
        return false
      }

      if (action==='+') {
        var id = (!parcel) ? cuid() : parcel
        var opts = {id: id}
        res.value = id

        var pkg = _.find(library,function(v,k){if(k.match(actor))return v})
        if (!pkg) {
          if (actor === 'bricoleur') { 
            canvas[id] = s 
            cb(null,res)
            return false 
          } else {
            cb(new Error('module: ' + actor + ' not found!'), null) 
            return false  
          }
        } 

        var mod = require(pkg.name)

        canvas[id] = (mod.length > 1) 
          ? mod(opts, moduleDataMuxDemux.createStream(id))
          : mod(opts)

        canvas[id].name = actor

        if (pkg.mask) canvas[id].mask = pkg.mask // mask from canvas save!

        if (canvas[id].$) { // do data binding
          var $ = canvas[id].$
          db.get('$:'+id, function (e,val){ 
            if (!e) { $.push(JSON.parse(val)) }
            cb(null, res)  // silent fail if !val
          })
        } else cb(null, res)
      }
    }

    if (type==='$' || type==='#') { 
      var key = type+':'+actor
      res.value = key
      if (action==='+') {
        var val
        if (type==='#') {
          cmds = []
          _.each(_.keys(canvas), function (k) {// note: masking is still weirdo
            var v = canvas[k]
            var mask
            var t = (v instanceof Array) ? '|' : '*'
            if (t==='|') v.forEach(function(m){if(canvas[m].mask)mask=true})
            if (t==='*') if (v.mask || v.name === 'bricoleur') mask = true
            var c = (t==='|') ? v.join('|')+':'+k : t+canvas[k].name+':'+k
            if (!mask) {cmds.push('+'+c)}
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
     return _.find(_.keys(canvas), function(k){
       return canvas[k].name === name
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
    return hash('sha256').update(pass).digest('hex')
  }

  return s
}

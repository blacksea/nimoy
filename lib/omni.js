var drompii = require('./drompii.js')
var pjs = require('./paper-core.js')
var upload = require('./upload.js')
var through = require('through2')
var dombii = require('./dombii.js')
var fs = require('fs')
var _ = require('underscore')
var r = require('./router.js')
var OMNI = fs.readFileSync(__dirname + '/omni.hogan', 'utf8')
var GRIFTER = fs.readFileSync(__dirname + '/grifter.hogan', 'utf8')
module.exports = function Omni (opts) {
  var frameList = null
  var frame = null
  var prefs
  var s = through.obj(IO)
  if (sessionStorage['edit']) // CHECK FOR SESSION
    s.push('+@edit '+sessionStorage['edit']+'/'+opts.id) // AUTH
  function IO (d, e, n) {
    if (d.code === 1) { console.error(d); n(); return null } // feedback on error!
    if (d.cmd) {
      if (d.cmd[1] === '#') frame = d.value // new canvas or canvas loaded
      if (d.cmd.slice(0,2) === '!#') { } // update canvas
    }
    if (d.timestamp) { // if updated save canvas
      if (!lastModified) lastModified = d.timestamp 
      if (lastModified !== d.timestamp) saveCanvas() 
    }
    db.write(d) // passthrough to router
    if (d.key && d.key.split(':')[1] === opts.id) { // check for return message! 
      if (d.key.split(':')[0] === '@edit') { // LOGGED IN!
        sessionStorage['edit'] = d.value
        omni.draw(null,buildUI)
        document.body.className = 'edit'
      } else if(d.value === '-edit'){omni.erase();document.body.className = ''}
    } 
    // on settings update omni data
    n()
  }
  var db = r() 
             .on('data', function (d) {  s.push(d) })
  db.get('?$settings', function (e,d) {if(!e){console.log(d);omni.data=d}})
  // GRIFTING
  var grift = new function Grifter () {
    var self = this
    this.hash = {}
    this.put = function (hash) { 
      self.hash = hash // format this to a diffable condition
    }
    this.diff = function (newHash) {
      if (newHash instanceof Array) newHash = _.object(newHash) // do the diff
      if (typeof blob.edit.index === 'number') {
        for (p in blob.edit.value) {
          var prop = {key:p,value:blob.edit.value[p]}
          d.props.push(prop)
        }
      } else d.props.push(blob.edit)
      d.name = blob.name
      d.cuid = blob.cuid
      d.tags = metaBlob.tags
      db.get('?~'+blob.cuid, function (e, data) {
        if (!e) { metaBlob = data; d.tags = metaBlob.tags }
        editor.draw(d)
      })
      s.push({key:'+$'+h.id+'/'+opts.id, value:nH}) // does this need the opts.id route?
      // old logic
      var key = e.target.parentElement.children[1].innerHTML
      var val = e.target.value.replace(/[\n\r]/g,'')
      if (key === 'tags') { 
        metaBlob.tags = val
        updateData(true)
        editor.erase()
      } else {
        if (typeof blob.edit.index === 'number') {
          blob.data[blob.edit.key][blob.edit.index][key] = val
        } else blob.data[key] = val
        updateData()
        editor.erase()
      }
      if (!pip) s.push({key:'+$'+blob.cuid+'/'+opts.id,value:blob.data})
        s.push({key:'+~'+blob.cuid+'/'+opts.id,value:metaBlob})
      // endold
    }
  }
  // END GRIFTNG
  var omni = new dombii({ 
    name : 'omni',
    id : opts.id,
    template : OMNI,
    parent : document.body,
    events : [ 
      ['.lib li','dragstart',function dragModule (e) { 
        e.dataTransfer.setData('cmd','+'+e.target.innerHTML.split('</b>')[1])
      }],
      ['.settings input','keyup', function (e) {
        if (e.keyCode===13) cancel(e);
      }],
      ['.login','submit',function (e) {
        cancel(e)
        s.push('+@edit '+e.target[0].value+'/'+opts.id)
        toggle('.login')
      }],
      [window,'contextmenu', function (e) { 
        cancel(e)
        grift.put(drompii(e.target)) 
        editor.data = {
          x : e.clientX + window.pageXOffset,
          y : (e.clientY - 20) + window.pageYOffset
        }
      }],
      ['.exit','click', function (e) { cancel(e); s.push('-@edit/'+opts.id) }]
    ]
  })
  var editor = new dombii({
    template : GRIFTER,
    events : [
      ['.grifter textarea','keyup', function (e) {
        cancel(e);
      }],
      ['.tags','keydown', function (e) { if (e.keyCode===13) cancel(e) }],
      ['.grifter textarea','keydown',function(e){if(e.keyCode===13)cancel(e)}],
      ['.grifter textarea','drop',function(e){
        // if (e.dataTransfer.files.length > 0) {
        //   editor.erase()
        //   upload(e, grift.hash, function (d) { // call editOut?!
        //     if (d.cuid === 'settings') 
        //       omni.draw({favicon:d.data.favicon},{title:d.data.title})
        //     grift.diff(d)
        //   })
        // }
      }],
      ['.tags','keyup', function(e){
        if(e.keyCode===13) cancel(e); grift.diff([e.target.value]);
      }],
      ['.grifter .del', 'click', function (e) {
        cancel(e); s.push('-'+blob.cuid); editor.erase()
      }],
      ['.grifter .reset', 'click', function (e) {
        cancel(e); s.push('!'+blob.cuid); editor.erase()
      }]
    ]
  }) 
  function SaveCanvas (e) { 
    if (!e) s.push('+#'+dx.cvs+'/'+opts.id)
    if (e && e.keyCode === 13) { 
      cancel(e)
      dx.cvs = e.target.value
      db.get('?#'+e.target.value, function (err, d) {
        if (err) {
          s.push('+#'+e.target.value+'/'+opts.id)
          openUrl.write('/'+e.target.value)
          e.target.blur()
        } else {
          openUrl.write('/'+e.target.value)
          e.target.blur()
        }
      })
    } 
  }
  window.addEventListener('keydown', function (e) { // KEYS
    if (e.keyCode === 13) if (e.ctrlKey || e.metaKey) 
      {e.preventDefault(); toggle('.login')}
  })
  document.addEventListener('drop', function (e) { // symbols ◼ ψ
    cancel(e)
    if (!e.dataTransfer.getData('cmd')) return false
    s.push(e.dataTransfer.getData('cmd') + '/' + opts.id)
  },false)
  document.addEventListener('dragover', cancel, false)
  return s
}
function buildUI () { // INCLUDE A STATUS UPDATE THING
  pjs.setup(document.querySelector('.bones')) // install paperScope
  pjs.project.currentStyle.fontFamily = 'bmono'
  pjs.project.currentStyle.fontSize = 10
  var canvas,tabs,panel,sH=pjs.view.bounds.height,sW=pjs.view.bounds.width
  var pane, tabBar
  var p_tabBG = new pjs.Path({
    segments: [[0,0]],
    fillColor:'#E5E5DC',
    shadowColor : 'black',
    shadowBlur:5,
    shadowOffset:new pjs.Point(0,-3)
  })
  var p_tabLabel = new pjs.PointText({point:[0,0],content:'',opacity:0.9})
  function newTab (content,max) {
    var l = p_tabLabel.clone(), b = p_tabBG.clone()
    l.content = (content.length>max) ? content.slice(0,max) : content
    var w = l.bounds.width+30, h = l.bounds.height+4
    b.segments = [[0,0], [w,0], [w-h,h], [0+h,h]]
    var t = new pjs.Group(b,l)
    t.children[1].position = t.children[0].position
    return t
  }
  var folds = {
    all : [[0,280],[24,78,180]],
    selected : [1,0],
    map : {db:[1,2],prefs:[1,1],cvs:[0,1]},
    fold : function (sel) {
      var prefsForm = document.querySelector('.settings')
      if (typeof sel === 'object' && sel.target)
        sel = (typeof sel === 'object') ? sel.target.data : sel
      var i = folds.map[sel][0]
      var v = folds.map[sel][1]
      if (folds.selected[i] === v) folds.selected[i] = 0
      else if (folds.selected[i] !== v) folds.selected[i] = v
      if (sel==='prefs'&&folds.selected[1]!==0) {
        if (prefsForm) prefsForm.style.display = 'block'
      } else if (sel==='prefs'&&folds.selected[1]===0) {
        if (prefsForm) prefsForm.style.display = 'none'
      } else if (sel==='db' && prefsForm){prefsForm.style.display='none'}
      folds.apply()
    }, 
    apply : function () {
      var spaces = [
        folds.all[0][folds.selected[0]],
        folds.all[1][folds.selected[1]]
      ]
      var h = spaces[0]+spaces[1]
      if (spaces[0]===0) {
        cvs.visible = false; 
        rB.visible = false
      }
      if (spaces[0]!==0) {cvs.visible = true; rB.visible = true}
      if (spaces[1]!==24) cap(spaces[1],h,true)
      if (spaces[1]===24) cap(spaces[1],h,false)
      tabBar.pos.y = spaces[0]+12
      cutCvs(h)
    }
  }
  function cutCvs(h){document.querySelector('.omni').style.height = h+'px'}
  var bm = new pjs.Path({segments:[0,0],fillColor:'#E5E5DC'})
  var cvs = new pjs.Shape.Rectangle({point: [0,0],size: [sW,280]})
  cvs.fillColor = '#FFFFF5'
  rB = new pjs.Path.Line({from:[0,0],to:[0,cvs.bounds.height],strokeColor:'#E5E5DC'})
  function cap (h,t,active) {
    bm.segments=[[0,t-h],[0,t-8],[8,t],[sW-8,t],[sW,t-8],[sW,t-h]]
    bm.fillColor = '#E5E5DC'
    if (active) bm.fillColor = 'blue' 
    bm.sendToBack()
  }
  tabBar = new function Tabs () {
    var self = this
    var bar,btns,togData,togSettings,togCvs,selected
    var tablist = []
    var tabs = new pjs.Group()
    function drawTabs (arr) {
      tabs.removeChildren()
      var max = Math.floor(((sW/arr.length)-17)/6)
      var tabOffset = 0
      arr.forEach(function (name) {
        var t = newTab(name, max)
        t.position.x = tabOffset+(t.bounds.width/2)
        t.data = name
        t.onClick = function (e) { self.select(e.target.parent) }
        tabs.addChild(t)
        tabOffset += t.bounds.width-20
      })
      tabs.position.x += 20
      pjs.view.draw()
    }
    btns = new pjs.Group([
      new pjs.Path.Circle({center:[12,12],radius:6,data:'db'}),
      new pjs.Path.Circle({center:[sW-26,12],radius:6,data:'prefs'}),
      new pjs.Path({segments:[[sW-4,12],[sW-16,12],[sW-10,6]],data:'cvs'})
    ])
    _.each(btns.children,function (o) {
      o.onClick = function (e) {
        folds.fold(e)
        if (e.target.data!=='cvs') _.each(btns.children, function (c) {
          c.fillColor = (c.fillColor.equals('blue')) ? 'white' : 'blue'
        })
        else if (e.target.data==='cvs') e.target.rotation = 180
      }
      o.fillColor='blue'
    })
    bar = new pjs.Group(new pjs.Path.Rectangle({
      point:[0,0],size:[sW,24],clipMask:true}),btns,tabs)
    this.add = function (title) { tablist.push(title); drawTabs(tablist) }
    this.select = function (item) {
      if (selected) {
        selected.children[0].fillColor = '#E5E5DC'
        selected.children[1].fillColor = 'black'
      }
      selected = item
      selected.children[0].fillColor = '#FFFFF5'
      selected.children[1].fillColor = 'blue'
      selected.bringToFront()
      pjs.view.draw()
    }
    this.np = function (direction) { 
      if (!selected) return
      var n = (direction==='>') 
       ? tablist[_.indexOf(tablist, selected.data)+1]
       : tablist[_.indexOf(tablist, selected.data)-1]
      if (!n) return 
      var ni = _.find(tabs.children,function(o,i,l){return (o.data===n) })
      if (ni) self.select(ni)
    }
    this.new = function () {
      pjs.view.draw()
    }
    this.pos = bar.position
  }
  folds.apply()
  pjs.view.draw()
  function drawSkeleton () {
    var scaleX = 130/window.innerWidth
    if (skeleton) skeleton.remove()
    skeleton = new pjs.Group({
      position : [0.0]
    })
    var bg = new pjs.Shape.Rectangle({
      point : [35, 45],
      size : [130, window.innerHeight*scaleX],
      clipMask : true
    })
    var Xoff = window.innerWidth/bg.bounds.width
    var Yoff = window.innerHeight/bg.bounds.height
    var view = new pjs.Group({
      position : [0,0]
    })
    view.addChild(skeleton)
    view.addChild(bg)
    skeleton.visible = true
    _.each(frame, function (v,k) {
      var el = document.getElementById(k).firstChild
      var bounds = [
        (el.offsetTop*scaleX)+45,
        el.offsetLeft*scaleX+35,
        el.offsetHeight*scaleX,
        el.offsetWidth*scaleX
      ]
      var r = new pjs.Shape.Rectangle({
        point : [bounds[1],bounds[0]],
        size : [bounds[3],bounds[2]],
        strokeColor : '#EBEEFB',
        fillColor : '#CBD5DF',
        strokeWidth : 1
      })
      skeleton.addChild(r)
    })
    var sTop = skeleton.position.y
    window.onscroll = function (e) {
      var y = ((e.pageY*scaleX) * (-1)) + sTop
      skeleton.position.y = y 
      console.log(y,sTop)
      pjs.view.draw()
    }
    pjs.view.draw()
  }
}
function toggle (e, cb) {
  var el = document.querySelector(e)
  if (!el) {if(cb)cb(null);return false}
  if (el.style.display !== 'block'){ el.style.display = 'block';if(cb)cb(el) }
  else {el.style.display = 'none';if(cb)cb(null)}
}
function cancel (e) { e.preventDefault() }
function url () { return window.location.pathname.replace('/','') }

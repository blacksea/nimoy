var drompii = require('./drompii.js')
var pjs = require('./paper-core.js')
var upload = require('./upload.js')
var dombii = require('./dombii.js')
var through = require('through2')
var r = require('./router.js')
var _ = require('underscore')
var fs = require('fs')
var OMNI = fs.readFileSync(__dirname + '/omni.hogan', 'utf8')
var GRIFTER = fs.readFileSync(__dirname + '/grifter.hogan', 'utf8')

module.exports = function Omni (opts) {

  var s = through.obj(IO)

  if (sessionStorage['edit']) // CHECK FOR SESSION
    s.push('+@edit '+sessionStorage['edit']+'/'+opts.id) // AUTH

  function IO (d, e, n) {
    if (d.code === 1) { console.error(d); n(); return null } // feedback on error!
    if (d.cmd) {
      if (d.cmd[1] === '#') frame = d.value // new canvas or canvas loaded
      if (d.cmd.slice(0,2) === '!#') {} // update canvas
    }
    if (d.timestamp) { // if updated save canvas
      if (!lastModified) lastModified = d.timestamp 
      if (lastModified !== d.timestamp) saveCanvas() 
    }
    db.write(d) // passthrough to router
    if (d.key && d.key.split(':')[1] === opts.id) { // check for return message! 
      if (d.key.split(':')[0] === '@edit') { // LOGGED IN!
        sessionStorage['edit'] = d.value
        document.body.className = 'edit'
        buildUI()
        window.addEventListener('contextmenu', rightClick,false)
      } else if (d.value === '-edit') {
        omni.erase()
        document.body.className = ''
        window.removeEventListener('contextmenu', rightClick,false)
      }
    }
    n()
  }

  var db = r() 
             .on('data', function (d) { s.push(d) })
  db.get('?$settings', function (e,d) { if (!e) { omni.draw(d) }})

  var grift = new function Grifter () { // GRIFTING
    var self = this
    var hash = {}
    this.put = function (newHash) { // drompii or homemade
      hash = newHash // format this to a diffable condition
      // if its not a drompii ...
      // hash to work on
      // make a blob!
    }
    this.diff = function (values) { // key, e.target.value
      if (values instanceof Array) values = _.object(newHash) // do the diff
      if (typeof blob.edit.index === 'number') {
        blob.data[blob.edit.key][blob.edit.index][key] = val
      } else blob.data[key] = val
      if (key === 'tags')
        s.push({key:'+~'+blob.cuid+'/'+opts.id,value:hash.meta})
      else
        s.push({key:'+$'+h.id+'/'+opts.id, value:nH}) // does this need the opts.id route?
      editor.erase()
    }
  }

  var omni = new dombii({ // store data here instead of making a bunch of extra vars
    name : 'omni',
    id : opts.id,
    template : OMNI,
    parent : document.body,
    events : [ 
      ['.lib li','dragstart',function dragModule (e) { 
        e.dataTransfer.setData('cmd','+'+e.target.innerHTML.split('</b>')[1])
      }],
      ['.settings input','keyup', function (e) {
        if (e.keyCode === 13) {
          cancel(e); console.log(e)
        }
      }],
      ['.login','submit',function (e) {
        cancel(e); s.push('+@edit '+e.target[0].value+'/'+opts.id)
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
      ['.tags','keydown', function (e) { 
        if (e.keyCode!==13) return
        cancel(e)
        var key = e.target.parentElement.children[1].innerHTML // old logic
        var val = e.target.value.replace(/[\n\r]/g,'')
        grift.diff([key,val])
      }],
      ['.grifter textarea','keydown',function (e) {
        if (e.keyCode1==13) return
        cancel(e)
        var key = e.target.parentElement.children[1].innerHTML // old logic
        var val = e.target.value.replace(/[\n\r]/g,'')
        grift.diff([key,val])
      }],
      ['.grifter textarea','drop', function (e) {
        if (e.dataTransfer.files.length > 0) {
          editor.erase()
          upload(e, grift.hash, function (d) { // call editOut?!
            if (d.cuid === 'settings') 
              omni.draw({favicon:d.data.favicon},{title:d.data.title})
            grift.diff(d)
          })
        }
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

  function rightClick (e) {
    cancel(e)
    editor.data = {
      x : e.clientX + window.pageXOffset,
      y : (e.clientY - 20) + window.pageYOffset
    }
    var hash = drompii(e.target)
    db.get('?~'+hash.cuid, function (e, d) {
      if (!e) {
        hash.meta = d
        grift.put(hash)
        editor.draw(d)
      }
    })
  }

  window.addEventListener('keydown', function (e) { // KEYS
    if (e.keyCode === 13) if (e.ctrlKey || e.metaKey) 
      { e.preventDefault(); toggle('.login') } // toggle omni / open fold
  })

  document.addEventListener('drop', function (e) { // symbols ◼ ψ
    cancel(e)
    if (!e.dataTransfer.getData('cmd')) return false
    s.push(e.dataTransfer.getData('cmd') + '/' + opts.id)
  },false)

  document.addEventListener('dragover', cancel, false)

  omni.draw()

  return s
}

function buildUI () { // INCLUDE A STATUS UPDATE THING
  pjs.setup(document.querySelector('.bones')) // install paperScope
  pjs.project.currentStyle.fontFamily = 'bmono'
  pjs.project.currentStyle.fontSize = 10
  var sH = pjs.view.bounds.height
  var sW = pjs.view.bounds.width

  // elements!
  var tabsBg = new pjs.Path({
    segments : [[0,0]],
    fillColor : '#E5E5DC',
    shadowColor : 'black',
    shadowBlur : 5,
    shadowOffset:new pjs.Point(0,-3)
  })
  var tabsTxt = new pjs.PointText({point:[0,0],content:'',opacity:0.9})
  var mask = new pjs.Path.Rectangle({point:[0,0],size:[sW,24],clipMask:true})
  var tabs = new pjs.Group()

  var panelBG = new pjs.Shape.Rectangle({point: [0,0],size: [sW,280]})
  var panelBorder = new pjs.Path.Line({
    from:[0,0],
    to:[0,280],
    strokeColor:'#E5E5DC'
  })
  var panelSlider = new pjs.Path({
    segments : [[0,t-h],[0,t-8],[8,t],[sW-8,t],[sW,t-8],[sW,t-h]],
    fillColor : '#FFFFF5'
  })
  var panelButtons = new pjs.Group([
    new pjs.Path.Circle({center:[12,12],radius:6,data:'db'}),
    new pjs.Path.Circle({center:[sW-26,12],radius:6,data:'prefs'}),
    new pjs.Path({segments:[[sW-4,12],[sW-16,12],[sW-10,6]],data:'cvs'})
  ])
  function panelBtnClick (e) {
    folds.fold(e.target.data)
    if (e.target.data!=='cvs') _.each(btns.children, function (c) {
      c.fillColor = (c.fillColor.equals('blue')) ? 'white' : 'blue'
    })
    else if (e.target.data==='cvs') e.target.rotation = 180
  }
  _.each(panelButtons.children, function (btn) {btn.onClick = panelBtnClick})
  var panelUi = new pjs.Group([mask,tabs,panelButtons])
  var panel = new pjs.Group([panelSlider,panelBg,panelBorder,panelUi])


  function cutCvs(h){document.querySelector('.omni').style.height = h+'px'}

  folds.apply()
  pjs.view.draw()

}
// UI rigging
var drawSkeleton = function (elements) {
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
    pjs.view.draw()
  }
  pjs.view.draw()
}

var folds = function (panel) {
  var all = [[0,280],[24,78,180]]
  var selected = [1,0]
  var map = { db: [1,2], prefs: [1,1], cvs: [0,1], login : [0,0] },
  function fold (sel) {
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
  function apply () {
    var spaces = [
      folds.all[0][folds.selected[0]],
      folds.all[1][folds.selected[1]]
    ]
    var h = spaces[0]+spaces[1]
    if (spaces[0]===0) {
      cvs.visible = false 
      rB.visible = false
    }
    if (spaces[0]!==0) {cvs.visible = true; rB.visible = true}
    if (spaces[1]!==24) cap(spaces[1],h,true)
    if (spaces[1]===24) cap(spaces[1],h,false)
    tabBar.pos.y = spaces[0]+12
    cutCvs(h)
  }
}

var Tabs = function (tabsBG,tabsTxt,tabs) {
  function clickTab (e) {
    var oldSelection = url() // name
    toggleTab(oldSelection)
    toggleTab(e.target.data)
    openUrl(e.target.value) // open new page
  }
  function addTab (name) {
    var tab = new pjs.Group(tabsBg.clone(),tabsTxt.clone())
    tab.children[1].content = name
    tab.onClick = clickTab
    tab.data = name
    tabs.addChild(tab)
    resizeTabs()
  }
  function rmTab (name) {
    _.findWhere(tabs.children,{data:name}).remove()
    resizeTabs()
  }
  function resizeTabs () {
    var max = Math.floor(((sW/tabs.children.length)-17)/6)
    var tabOffset = 0
    _.each(tabs.children, function (t) {
      var lbl = t.children[1]
      var bg = t.children[0]
      lbl.content = (content.length>max) ? content.slice(0,max) : content
      var w = lbl.bounds.width+30 
      var h = lbl.bounds.height + 4
      bg.segments = [[0,0], [w,0], [w-h,h], [0+h,h]]
      lbl.position = bg.position
      t.position.x = tabOffset+(t.bounds.width/2)
      tabOffset += t.bounds.width-20
    })
  }
  function toggleTab (dataProp) {
    var sel = _.findWhere(tabs.children,{data:dataProp})
    var bg = sel.children[0]
    var lbl = sel.children[1]
    bg.fillColor = (bg.fillColor.equals('#E5E5DC')) ? '#FFFFF5' : '#E5E5DC'
    lbl.fillColor = (lbl.fillColor.equals('black')) ? 'blue' : 'black'
  }
  function cycleTab (direction) { 
    if (!selected) return
    var n = (direction==='>') 
     ? tablist[_.indexOf(tablist, selected.data)+1]
     : tablist[_.indexOf(tablist, selected.data)-1]
    if (!n) return 
    var ni = _.find(tabs.children,function(o,i,l){return (o.data===n) })
    if (ni) self.select(ni)
  }
} // end rigging

function toggle (e, cb) {
  var el = document.querySelector(e)
  if (!el) { if (cb) cb(null); return false}
  if (el.style.display !== 'block'){el.style.display = 'block'; if (cb) cb(el)}
  else {el.style.display = 'none'; if (cb) cb(null) }
}
function cancel (e) { e.preventDefault() }
function url () { return window.location.pathname.replace('/','') }

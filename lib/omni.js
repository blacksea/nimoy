var drompii = require('./drompii.js')
var pjs = require('./paper-core.js')
var upload = require('./upload.js')
var dombii = require('./dombii.js')
var through = require('through2')
var r = require('./router.js')
var _ = require('underscore')
var fs = require('fs')

var OMNI = fs.readFileSync(__dirname + '/omni.hogan', 'utf8')
var LOGIN = fs.readFileSync(__dirname + '/login.hogan', 'utf8')
var GRIFTER = fs.readFileSync(__dirname + '/grifter.hogan', 'utf8')

var gui
var s

module.exports = function Omni (opts) {
  s = through.obj(IO)

  // run events minus omni at first --- use sep. login :/
  // try to open session > then open tab 
  var db = r() 
             .on('data', function (d) { s.push(d) })
  db.get('?$settings', function (e,d) { if (!e) { omni.draw(d) }})

  if (sessionStorage['edit']) // LOGIN
        s.push('+@edit '+sessionStorage['edit']+'/'+opts.id)

  function IO (d, e, n) { // grrrr ifs
    if (d.code === 1) { console.error(d); n(); return null } // rm session if expired
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
        login.erase()
        sessionStorage['edit'] = d.value
        document.body.className = 'edit'
        omni.draw(null, function init () {
          buildUI(function handleSession () { // ui should be invisible at first
            /// open tab
            gui.tabs.add(url())
            gui.folds.to('cvs')
          })
        })
      } else if (d.value === '-edit') {
        omni.erase()
        document.body.className = ''
        window.removeEventListener('contextmenu', rightClick,false)
      }
    }
    n()
  }

  document.addEventListener('drop', function (e) { // symbols ◼ ψ
    cancel(e)
    if (!e.dataTransfer.getData('cmd')) return false
    s.push(e.dataTransfer.getData('cmd') + '/' + opts.id)
  },false)
  document.addEventListener('dragover', cancel, false)

  omni.draw()

  return s
}
var login = new dombii({
  name : 'login',
  template : LOGIN,
  events : [['.login','submit', function (e) {
      cancel(e); s.push('+@edit '+e.target[0].value+'/0mNii')
  }]]
})
var omni = new dombii({
  name : 'omni',
  id : '0mNii',
  template : OMNI,
  parent : document.body,
  events : [ 
    [window,'contextmenu',rightClick],
    ['.lib li', 'dragstart', function dragModule (e) { 
      e.dataTransfer.setData('cmd','+'+e.target.innerHTML.split('</b>')[1])
    }],
    ['.settings input', 'keyup', function (e) {
      if (e.keyCode === 13) { cancel(e); console.log(e) }
    }],
    ['.login','submit', function (e) {
      cancel(e); s.push('+@edit '+e.target[0].value+'/0mNii')
    }],
    ['.exit','click', function (e) { cancel(e); s.push('-@edit/0mNii') }]
  ]
})
var editor = new dombii({
  template : GRIFTER,
  events : [
    ['.grifter textarea','keyup', function (e) {
      cancel(e)
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
    ['.tags','keyup', function (e) {
      if(e.keyCode===13) cancel(e); grift.diff([e.target.value])
    }],
    ['.grifter .del', 'click', function (e) {
      cancel(e); s.push('-'+blob.cuid); editor.erase()
    }],
    ['.grifter .reset', 'click', function (e) {
      cancel(e); s.push('!'+blob.cuid); editor.erase()
    }]
  ]
}) 
var grift = new function Grifter () {// GRIFTING
  var self = this
  var hash = {}
  this.put = function (newHash) { // drompii or homemade
    hash = newHash
    // format this to a diffable condition
    // if its not a drompii ...
    // hash to work on
    // make a blob!
  }
  this.diff = function (values) {// key, e.target.value
    if (values instanceof Array) values = _.object(newHash)// do the diff
    if (typeof blob.edit.index === 'number') {
      blob.data[blob.edit.key][blob.edit.index][key] = val
    } else blob.data[key] = val
    if (key === 'tags')
      s.push({key:'+~'+blob.cuid+'/'+opts.id, value:hash.meta})
    else
      s.push({key:'+$'+h.id+'/'+opts.id, value:nH})
    editor.erase()
  }
}
function buildUI (cb) { // INCLUDE A STATUS UPDATE THING
  pjs.setup(document.querySelector('.bones')) // install paperScope
  pjs.project.currentStyle.fontFamily = 'bmono'
  pjs.project.currentStyle.fontSize = 10
  var sH = pjs.view.bounds.height
  var sW = pjs.view.bounds.width
  var tabsBg = new pjs.Path({
    segments : [[0,0]],
    fillColor : '#EBEEFB',
    shadowColor : 'black',
    shadowBlur : 5,
    shadowOffset : new pjs.Point(0,-3)
  })
  var tabsTxt = new pjs.PointText({point:[0,0],content:'',opacity:0.9})
  var mask = new pjs.Path.Rectangle({point:[0,0],size:[sW,24],clipMask:true})
  var tabs = new pjs.Group()
  var panelBorder = new pjs.Path.Line({
    from : [0,0],
    to : [0,280],
    strokeColor : '#E5E5DC'
  })
  var panelBg = new pjs.Shape.Rectangle({
    point : [0,0],
    size : [sW,280],
    fillColor : '#FFFFF5'
  })
  var panelSlider = new pjs.Path({segments:[0,0],fillColor:'#E5E5DC'})
  panelSlider.segments = [[0,0],[0,16],[8,24],[sW-8,24],[sW,16],[sW,0]]
  var panelButtons = new pjs.Group([
    new pjs.Path.Circle({ center : [12,12], radius : 6, data : 'db'}),
    new pjs.Path.Circle({ center : [sW-26,12], radius : 6, data : 'prefs'}),
    new pjs.Path({segments : [[sW-4,12],[sW-16,12],[sW-10,6]], data : 'cvs'})
  ])
  var panelUi = new pjs.Group([
    panelSlider,
    new pjs.Group([mask,tabs]),
    panelButtons
  ])
  panelUi.position.y = panelBg.bounds.height+(panelUi.bounds.height/2)
  var panel = new pjs.Group([panelBg,panelBorder,panelUi])
  gui = {
    folds : new Folds (panel),
    tabs : new Tabs (tabsBg,tabsTxt,panelUi.children[1])
  }
  _.each(panelButtons.children, function (btn) {
    btn.fillColor = 'blue'
    btn.onClick = function (e) { 
      var name = e.target.data
      gui.folds.to(name)
      if (name === 'prefs') toggle('.settings')
      if (name === 'db') document.querySelector('.settings').style.display='none'
      if (name === 'cvs') 
        _.findWhere(panelButtons.children,{data:'cvs'}).rotation=180
      else {
        _.each(panelButtons.children,function (b) {
          b.fillColor = (panelSlider.fillColor.equals('blue')) ?'white':'blue'
        })
      }
    }
  })
  cb()
}
var Folds = function (panel) { // UI rigging
  var sW = pjs.view.bounds.width
  var cels = [[-280,0],[16,78,180]]
  var celMap = {db:[1,2],prefs:[1,1],cvs:[0,1],login:[0,0]}
  var cel = [0,0]
  var panelUi = panel.children[2]
  var slider = panelUi.children[0]
  var btns = panelUi.children[2]
  this.to = function (celName) {
    if (celName === 'login') btns.visible = false
    if (celName !== 'login') btns.visible = true
    slider.fillColor = '#E5E5DC'
    var sY = slider.segments[0].point.y
    var n = celMap[celName]
    if (cel[n[0]] === n[1] && n[1] !== 0) cel[n[0]] = 0
    else cel[n[0]] = n[1]
    var celA = cels[0][cel[0]]
    var celB = cels[1][cel[1]]
    if (celB!==cels[1][0]) slider.fillColor = 'blue'
    slider.segments = [
      [0,sY],
      [0,sY+celB],
      [8,sY+celB+8],
      [sW-8,sY+celB+8],
      [sW,sY+celB],
      [sW,sY]
    ]
    panel.position.y = (panel.bounds.height/2)+(celA)
    var vH = (panel.position.y - (panel.bounds.height/2)) + panel.bounds.height
    pjs.view.draw()
    cutCvs(vH)
  }
}
var Tabs = function (tabsBg,tabsTxt,tabG) {
  var tabs = tabG.children[1]
  var sW = pjs.view.bounds.width
  var selected = null
  var tabList = []
  this.add = function (name) {
    var tab = new pjs.Group(tabsBg.clone(), tabsTxt.clone())
    tab.children[1].content = name
    tab.data = name
    tab.onClick = function (e) { clickTab(e.target.parent.data) }
    tabs.addChild(tab)
    tabList.push(name)
    resizeTabs()
    clickTab(name)
  }
  this.rm = function (name) {
    _.findWhere(tabs.children,{data : name}).remove()
    tabList.splice(_.indexOf(tabList,name))
    resizeTabs()
  }
  this.cycle = function (direction) { 
    var n = (direction==='>') 
     ? tabList[_.indexOf(tabList, selected)+1]
     : tabList[_.indexOf(tabList, selected)-1]
    if (!n) return 
    self.clickTab(ni)
  }
  function resizeTabs () {
    var max = Math.floor(
      ((sW-48-(tabs.children.length*16))/tabs.children.length)/6)
    var tabOffset = 20
    tabs.position.y = tabG.children[0].position.y
    _.each(tabs.children, function (t) {
      var lbl = t.children[1]
      var bg = t.children[0]
      content = t.data
      lbl.content = (content.length>max) ? content.slice(0,max) : content
      var w = lbl.bounds.width+30 
      var h = lbl.bounds.height+4
      bg.segments = [[0,0],[w,0],[w-h,h],[0+h,h]]
      lbl.position = bg.position
      t.position.x = tabOffset+(t.bounds.width/2)
      t.position.y = (tabG.children[0].position.y-4)
      tabOffset += t.bounds.width-20
    })
    pjs.view.draw()
  }
  function toggleTab (dataProp) {
    var sel = _.findWhere(tabs.children,{data:dataProp})
    var bg = sel.children[0]
    var lbl = sel.children[1]
    bg.fillColor = (bg.fillColor.equals('#EBEEFB')) ? '#FFFFF5' : '#EBEEFB'
    lbl.fillColor = (lbl.fillColor.equals('black')) ? 'blue' : 'black'
  }
  function clickTab (name) {
    if (selected) toggleTab(selected)
    toggleTab(name)
    // openUrl(name) // open new page
    selected = name
    pjs.view.draw()
  }
}
var drawSkeleton = function (elements) {
  var scaleX = 130/window.innerWidth
  if (skeleton) skeleton.remove()
  skeleton = new pjs.Group({
    position : [0,0]
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
      (el.offsetTop * scaleX) + 45,
      el.offsetLeft * scaleX + 35,
      el.offsetHeight * scaleX,
      el.offsetWidth * scaleX
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
} // end rigging
function SaveCanvas (e) { 
  if (!e) s.push('+#'+dx.cvs+'/'+opts.id)
  if (e && e.keyCode === 13) { 
    cancel(e)
    dx.cvs = e.target.value
    db.get('?#'+e.target.value, function (err, d) {
      if (err) {
        s.push('+#'+e.target.value+'/'+opts.id)
        openUrl(e.target.value)
        e.target.blur()
      } else {
        openUrl(e.target.value)
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
  db.get('?~' + hash.cuid, function (e, d) {
    if (!e) {
      hash.meta = d
      grift.put(hash)
      editor.draw(d)
    }
  })
}
function toggle (e, cb) {
  var el = document.querySelector(e)
  if (!el) { if (cb) cb(null); return false}
  if (el.style.display !== 'block'){el.style.display = 'block';if (cb) cb(el)}
  else {el.style.display = 'none'; if (cb) cb(null) }
}
function cutCvs (h) { document.querySelector('.omni').style.height = h + 'px' }
function cancel (e) { e.preventDefault() }
function url () { 
  var loc = window.location.pathname
  var safeLink = (loc==='/') ? loc.replace('/','home') : loc.replace('/','')
  return safeLink
}
function openUrl (loc) {
  var link = (loc === 'home') ? '/' : loc
  var safeLink = (loc==='/') ? loc.replace('/','home') : loc.replace('/','')
  history.pushState({cmd:'!#'+safeLink},'',link)
  this.push('!#'+safeLink)
}
window.addEventListener('keydown', function (e) { // KEYS
  if (e.keyCode === 13) if (e.ctrlKey || e.metaKey) {  
    if (document.querySelector('.container .login')) login.erase()
    if (!sessionStorage.edit) login.draw()
  } 
})

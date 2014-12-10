var asyncMap = require('slide').asyncMap
var drompii = require('./drompii.js')
var pjs = require('./paper-core.js')
var upload = require('./upload.js')
var through = require('through2')
var D = require('./dombii.js')
var path = require('path')
var fs = require('fs')


var r = require('./router.js')
var _ = require('underscore')


var LOGIN = fs.readFileSync(__dirname + '/login.hogan', 'utf8') 
var ERROR = fs.readFileSync(__dirname + '/error.hogan', 'utf8') 
var OMNI = fs.readFileSync(__dirname + '/omni.hogan', 'utf8')
var GRIFTER = fs.readFileSync(__dirname + '/grifter.hogan', 'utf8')


module.exports = function Omni (opts) {
  var frameList = null
  var frame = null
  var svg = null
  var blob
  var metaBlob 
  var scale = 0.45
  var lastModified

  function url () { 
    return window.location.pathname.replace('/','') 
  }

  var s = through.obj(IO)

  var db = r()
             .on('data', function (d) {  s.push(d) })

  if (!localStorage[opts.id]) { // NOT SURE ABOUT TOP LEVEL DX BUT...
    var dx = {x:0,y:0}
    localStorage[opts.id] = JSON.stringify({data:dx})
  } else 
    var dx = JSON.parse(localStorage[opts.id]).data

  dx.showSettings = false
  dx.lib = _.values(opts.lib)
  dx.cvs = (window.location.pathname==='/@'||window.location.pathname==='/')
    ? 'home'
    : window.location.pathname.replace('/','')
 

  var editor = new D({
    template : GRIFTER,
    name : 'grifter',
    parent : document.body,
    drag : true,
    events : [
      ['.tags','keydown',editIN],
      ['.tags','keyup',editOUT],
      ['.grifter textarea', 'keyup', editOUT],
      ['.grifter textarea', 'keydown', editIN],
      ['.grifter .del', 'click', function (e) {
        cancel(e); s.push('-'+blob.cuid); editor.erase()
      }],
      ['.grifter .reset', 'click', function (e) {
        cancel(e); s.push('!'+blob.cuid); editor.erase()
      }]
    ]
  })

  var err = new D({ // REMOVE
    name : 'error',
    template : ERROR,
    parent : document.body,
    events : [
      ['span','click', function (e) { e.preventDefault(); err.erase() } ]
    ]
  })

  var login = new D({ // REMOVE
    name : 'login',
    id : opts.id,
    drag : true,
    template : LOGIN,
    parent : document.body,
    events : [['.login', 'submit', function (e) {
      e.preventDefault() 
      s.push('+@edit '+e.target[0].value+'/'+opts.id)
      e.target[0].value = ''
    }]]
  })

  var omni = new D({ 
    name : 'omni',
    id : opts.id,
    template : OMNI,
    parent : document.body,
    events : [
      ['.lib li','dragstart',dragModule],
      ['.settings .favicon','keyup',updateSettings],
      ['.settings .title','keyup',updateSettings],
      ['.settings .save','keyup',saveCanvas],
      ['.canvasName','keyup',saveCanvas],
      [window,'contextmenu',grifter],
      ['.exit','click',function (e) { cancel(e); s.push('-@edit/'+opts.id) }]
    ]
  })


  function dragModule (e) { 
    cmd = '+'+e.target.innerHTML.split('</b>')[1]
    e.dataTransfer.setData('cmd',cmd)
  }
  document.addEventListener('drop', function (e) { // symbols ◼ ψ
    cancel(e)
    cmd = null
    if (e.dataTransfer.files.length > 0) {
      editor.erase()
      upload(e, blob, function (d) { 
        if (d.cuid==='settings'&&dx.showSettings) {
          dx.favicon = d.data.favicon
          dx.title = d.data.title
          omni.draw(dx)
        }
        updateData()
      })
    } else cmd = e.dataTransfer.getData('cmd')
    if (cmd) s.push(cmd+'/'+opts.id)
    else return false
  },false)
  document.addEventListener('dragover', cancel, false)


  if (sessionStorage['edit']) // LOGIN
    s.push('+@edit '+sessionStorage['edit']+'/'+opts.id)


  function uiInit () {
    var canvas 
    var tabs
    var panel
    var sH = pjs.view.bounds.height
    var sW = pjs.view.bounds.width

    pjs.setup(document.querySelector('.bones')) // install paperScope

    var p_tab = new pjs.Path([ [0,0], [0,0], [0,0], [0,0] ])
    var p_tabLabel = new pjs.PointText({
      fillColor : 'blue',
      point : [0,0],
      content : '',
      fontFamily : 'bmono',
      fontSize : 10,
      opacity : 0.75
    })

    function newTab (label,x,y,w,h) {
      var segs = [ [0,0], [w,0], [w-h,h], [0+h,h] ]
      var t = new pjs.Group([p_tab.clone(),t_tabLabel.clone()])
      var b = t.children[0]
      var l = t.children[1]
      b.segments = segs
      l.content = label
      l.position = b.position
      t.position = [x+(w/2),y+(h/2)]
      return t
    }

    function tabs (array, h) {
      // char is 6px wide
      var w = 2 // default tiny -- calculate width!
      var bg = new pjs.Path([ [0,0], [w,0], [w-h,h], [0+h,h] ])

      // clone and then alter segments
      // space out the tab ends!
      
      // BUTTONS
      var togData = new pjs.Path.Circle({
        center:[13,sH-12],
        radius:6,
        fillColor:'blue'
        data:'data'
      })
      var togSettings = new pjs.Path.Circle({
        center : [sW-30,sH-12],
        radius : 6,
        fillColor : 'blue',
        data : 'sets'
      })
      var togCanvas = new pjs.Path({
        segments: [
          [sW-6,sH-12],
          [sW-18,sH-12],
          [sW-12,sH-19]
        ],
        fillColor : 'blue'
      })
    }

    var pane = new function Panel () {
      var self = this

      this.fold = function (sect) {
        return sect
      }
    }

    // CANVAS
    var cvs = new pjs.Shape.Rectangle({
      point : [0,0],
      size : [pjs.view.bounds.width,pjs.view.bounds.height-24],
      fillColor : '#FFFFF5'
    })
    var rB = new pjs.Path.Line({from:[0,0],to:[0,sH-24],strokeColor:'#E5E5DC'})

    function clipCanvas (h) {
      document.querySelector('.omni').style.height = h+'px'
    }

    var cap = new pjs.Path({
      segments:[ // GLUED TO BOTTOM
        [0,pjs.view.bounds.height-24],
        [0,pjs.view.bounds.height-8],
        [8,pjs.view.bounds.height],
        [pjs.view.bounds.width-8,pjs.view.bounds.height],
        [pjs.view.bounds.width,pjs.view.bounds.height-8],
        [pjs.view.bounds.width,pjs.view.bounds.height-24]
      ],
      fillColor:'#E5E5DC'
    })

    function tablle (group) {
      var selected, unselected
      if (group.children[1].content === 'Skeleton') {
        selected = Rtab
        unselected = Ltab
      } else {
        selected = Ltab
        unselected = Rtab
      }
      selected.children[0].fillColor = '#FFFFF5'
      selected.children[1].fillColor = 'blue'
      unselected.children[0].fillColor = 'rgba(0,0,0,0.2)'
      unselected.children[1].fillColor = 'blue'
      selected.bringToFront()
      pjs.view.draw()
    }

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

    tablle(Ltab)
  }


  function IO (d, enc, next) {
    var self = this

    if (d.cmd && d.cmd[1]==='#') frame = d.value

    if (d.cmd && typeof d.cmd === 'string' && d.cmd.slice(0,2)==='!#') 
      if (document.querySelector('.o3mni')) {
        dx.cvs = d.cmd.slice(2).split('/')[0]
        omni.draw(dx)
      }
    
    if (!lastModified && d.timestamp){lastModified = d.timestamp;saveCanvas()}
    if (d.timestamp && d.timestamp !== lastModified) saveCanvas()

    db.write(d)

    if (d.code === 1) { // ERROR
      next() 

      if (!login.data) 
        login.draw(JSON.parse(localStorage[opts.id]).data)

      err.draw({x : login.data.x+8, y : login.data.y + 36, msg : d.message})

      _.delay(err.erase,2200)

      return null
    } else if (!d.key) { next(); return null }

    var tkn = (d.key.split(':').length > 1) 
      ? d.key.split(':')[1]
      : d.key
  
    if (tkn && tkn === opts.id) { 
      if (d.key.split(':')[0] === '@edit') {
        sessionStorage['edit'] = d.value
        login.erase()
        omni.draw(dx, uiInit)
        document.body.className = 'edit'
      } else if (d.value==='-edit') {
        omni.erase()
        grifter.erase()
        document.body.className=''
      } 
    } 

    next()
  }

  function saveCanvas (e) { 
    var c
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
    } else if (!e) {
      s.push('+#'+dx.cvs+'/'+opts.id)
    }
  }

  function grifter (e) {
    cancel(e)
    blob = {}
    metaBlob = {}

    editor.erase()

    var d = {  
      x : e.clientX+window.pageXOffset,
      y : (e.clientY-20)+window.pageYOffset,
      props : []
    }

    if (e.target.className !== 'canvasName' || e.target.tagName !== 'HTML') {
      blob = drompii(e) 

      if (!blob) return false

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
        console.log(e)
        console.log(data)
        if (!e) { metaBlob = data; d.tags = metaBlob.tags }
        editor.draw(d)
      })
    }
  }

  function editOUT (e) { // some intelligent feedback / filtering
    var cmd 

    var key = e.target.parentElement.children[1].innerHTML
    var val = e.target.value.replace(/[\n\r]/g,'')

    if (e.keyCode === 13) {
      cancel(e)
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
    }
  }

  function toggleSettings (e) {
    cancel(e)
    if (!dx.showSettings) db.get('?$settings', function (e,d) { 
      dx.showSettings = true
      dx.title = d.title
      dx.favicon = d.favicon
      blob = {
        cuid : 'settings',
        edit : { key : 'favicon' },
        data : d
      }
      omni.draw(dx)
    })
    if (dx.showSettings) {dx.showSettings = false;omni.draw(dx)}
  }
  
  function updateSettings (e) {
    if (e.keyCode === 13) {
      cancel(e)
      var type = e.target.className
      blob.data[type] = e.target.value
      if (type==='title' || type==='favicon')
        s.push({key:'+$settings',value:blob.data})
    }
  }

  function editIN (e) { if (e.keyCode === 13) cancel(e) }

  function updateData (pip) {
    metaBlob.freshness = new Date().getTime()
    metaBlob.name = blob.name
    if (!pip) s.push({key:'+$'+blob.cuid+'/'+opts.id,value:blob.data})
    s.push({key:'+~'+blob.cuid+'/'+opts.id,value:metaBlob})
  }

  window.addEventListener('keydown', function (e) { // KEYS
    if (e.keyCode === 13 && e.ctrlKey) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if (!document.querySelector('.login')&&!document.querySelector('.omni')){
          login.draw(JSON.parse(localStorage[opts.id]).data)
          document.querySelector('.login input').focus()
        } else login.erase()
      }
    }
  })

  return s
}

function cancel (e) { e.preventDefault() }

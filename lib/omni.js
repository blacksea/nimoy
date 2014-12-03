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
  var blob = {}
  var scale = 0.45


  function url () { return window.location.pathname.replace('/','') }


  var s = through.obj(IO)


  var db = r()
             .on('data', function (d) {  s.push(d) })


  if (!localStorage[opts.id]) {
    var dx = {x : 10, y : 10}
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

  
  var err = new D({
    name : 'error',
    template : ERROR,
    parent : document.body,
    events : [
      ['span','click', function (e) { e.preventDefault(); err.erase() } ]
    ]
  })


  var login = new D({ 
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
    drag : true,
    template : OMNI,
    parent : document.body,
    events : [
      ['.lib li','dragstart',dragModule],
      ['.settings input','keyup',updateSettings],
      ['.file','click',toggleSettings],
      ['.blackbox input','keyup',blackbox],
      ['.canvasName','keyup',saveCanvas],
      [window,'contextmenu', grifter],
      ['.exit','click', function (e) { cancel(e);s.push('-@edit/'+opts.id) }]
    ]
  })
  

  function toggleSettings (e) {
    cancel(e)
    if (!dx.showSettings) db.get('?$settings', function (d) { // grab fresh settings
      dx.showSettings = true
      dx.title = d.title
      dx.favicon = d.favicon
      omni.draw(dx)
      e.target.style.background = '#CBD4DD'
      blob = {
        cuid : 'settings',
        edit : {
          key : 'favicon'
        },
        data : d
      }
    })
    if (dx.showSettings) {
      dx.showSettings = false
      omni.draw(dx)
      e.target.style.background = 'transparent'
    }
  }


  function updateSettings (e) {
    if (e.keyCode === 13) {
      cancel(e)
      var type = e.target.className

      if (type==='save') { // make a new canvas using existing 
        s.push('+#'+e.target.value)
        return false
      }

      if (type==='new') { // make a new clean canvas!
        // s.push({key:'+$settings',value:nd})
        return false
      }

      if (type==='title' || type==='favicon') {
        blob.data[type] = e.target.value
        console.log(blob)
        s.push({key:'+$settings',value:blob.data})
      }
    }

  }


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
        updateData(blob)
      })
    } else cmd = e.dataTransfer.getData('cmd')
    if (cmd) s.push(cmd+'/'+opts.id)
    else return false
  },false)
  document.addEventListener('dragover', cancel, false)


  if (sessionStorage['edit']) // LOGIN
    s.push('+@edit '+sessionStorage['edit']+'/'+opts.id)


  window.addEventListener('keydown', function (e) { // KEYS
    if (e.keyCode === 13 && e.ctrlKey) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if(!document.querySelector('.login')&&!document.querySelector('.omni')){
          login.draw(JSON.parse(localStorage[opts.id]).data)
          document.querySelector('.login input').focus()
        } else login.erase()
      }
    }
  })


  // EVENTS
  var lastModified
  function IO (d, enc, next) {
    var self = this

    // changed canvas so reload!
    if (d.cmd && typeof d.cmd === 'string' && d.cmd.slice(0,2)==='!#') 
      if (document.querySelector('.omni')) {
        dx.cvs=d.cmd.slice(2)
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
      // smart routing or filtering carbuncle needed
      
      if (d.key.split(':')[0] === '@edit') { // LOGIN
        sessionStorage['edit'] = d.value
        login.erase()
        omni.draw(dx, pjsInit)
      } else if (d.value === '-edit') omni.erase() // LOGOUT
    } 

    next()
  }


  function pjsInit () {
    pjs.setup(document.querySelector('.bones'))

    var LtabBG = new pjs.Path([
      [0,0],
      [0,15],
      [130,15],
      [115,0]
    ])

    var LtabTXT = new pjs.PointText({
      point : [0,0],
      content : 'Pallette',
      fontFamily : 'Andale Mono',
      fontSize : 10,
      opacity : 0.75
    })

    var Ltab = new pjs.Group([LtabBG,LtabTXT])
    var Rtab = Ltab.clone()

    Ltab.children[1].position = tabCenter(Ltab)

    Rtab.children[0].segments = [
      [85,0],
      [70,15],
      [200,15],
      [200,0]
    ]
  
    Rtab.children[1].content = 'Skeleton'
    Rtab.children[1].position = tabCenter(Rtab)
    Ltab.onClick = function (e) {tablle(Ltab)}
    Rtab.onClick = function (e) {tablle(Rtab)}

    function tabCenter (group) {
      var segs = group.children[0].segments
      var x = ((segs[2].point.x - segs[1].point.x)/2) + segs[1].point.x
      var y = segs[1].point.y/2
      return [x,y]
    }

    function tablle (group) {
      var selected, unselected

      if (group.children[1].content === 'Skeleton') {
        selected = Rtab
        unselected = Ltab
        document.querySelector('.omni .lib').style.display = 'none'
      } else {
        selected = Ltab
        unselected = Rtab
        document.querySelector('.omni .lib').style.display = 'block'
      }

      selected.children[0].fillColor = '#EBEEFB'
      selected.children[1].fillColor = 'black'
      unselected.children[0].fillColor = '#CBD5DF'
      unselected.children[1].fillColor = '#333'
      selected.bringToFront()
      pjs.view.draw()
    }

    tablle(Ltab)
  }

  function saveCanvas (e) { 
    var c
    if (e && e.keyCode === 13) { 
      cancel(e)
      dx.cvs = e.target.value
      db.get('?#'+e.target.value, function (d) {
        if (d instanceof Error) {
          s.push('+#'+e.target.value+'/'+opts.id)
          openUrl.write('/'+e.target.value)
          e.target.blur()
        } else {
          openUrl.write('/'+e.target.value)
          e.target.blur()
        }
      })
    } else if (!e) {
      console.log('saving '+dx.cvs)
      s.push('+#'+dx.cvs+'/'+opts.id)
    }
  }


  function blackbox (e) {
    var val = e.target.value
    if (e.keyCode === 13 || e.key === 'Enter') {
      e.preventDefault()
      e.target.value = ''
      s.push(val+'/'+opts.id)
    } 
  } 


  function grifter (e) {
    cancel(e)
    blob = {}

    editor.erase()

    var d = {  
      x : e.clientX+window.pageXOffset,
      y : (e.clientY-20)+window.pageYOffset,
      props : []
    }

    if (e.target.className!=='canvasName'||e.target.tagName!=='HTML') {
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
      d.reup = true
      d.rm = true
    }
    
    editor.draw(d)
  }


  function editOUT (e) { // some intelligent feedback / filtering
    var cmd 

    var key = e.target.parentElement.children[1].innerHTML
    var val = e.target.value.replace(/[\n\r]/g,'')

    if (e.keyCode === 13) {
      if (key==='+copy') {
        var c = window.location.pathname.replace('/','')
        s.push('&#'+c+' '+val)
        editor.erase()
      } else {
        if (typeof blob.edit.index === 'number') {
          blob.data[blob.edit.key][blob.edit.index][key] = val
        } else blob.data[key] = val
        updateData(blob)
        editor.erase()
      }
    }
  }


  function editIN (e) { if (e.keyCode === 13) cancel(e) }


  function updateData (d) {
    s.push({key:'+$'+d.cuid+'/'+opts.id, value:d.data})
    var pkg = _.findWhere(dx.lib,{'name':d.name})
    console.log(pkg)
    if (pkg) s.push({key:'+~'+d.cuid+'/'+opts.id, value:pkg}) // use pkg as a base for microdata
  }

  return s
}


function cancel (e) { e.preventDefault() }

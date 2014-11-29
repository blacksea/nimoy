var asyncMap = require('slide').asyncMap
var drompii = require('./drompii.js')
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
    var dx = {x:10,y:10}
    localStorage[opts.id] = JSON.stringify({data:dx})
  } else 
    var dx = JSON.parse(localStorage[opts.id]).data


  dx.lib = _.values(opts.lib)
  dx.cvs = (window.location.pathname==='/@'||window.location.pathname==='/')
    ? 'home'
    : window.location.pathname.replace('/','')

 
  var editor = new D({
    template : GRIFTER,
    parent : document.body,
    drag : true,
    events : [
      ['.grifter textarea', 'keyup', editOUT],
      ['.grifter textarea', 'keydown', editIN],
      ['.grifter .rm', 'click', function (e) {
        cancel(e); s.push('-'+blob.cuid); editor.erase()
      }],
      ['.grifter .reup', 'click', function (e) {
        cancel(e); s.push('!'+blob.cuid); editor.erase()
      }]
    ]
  })

  
  var err = new D({
    name : 'error',
    template : ERROR,
    parent : document.body,
    events : [
      ['span','click',function (e){e.preventDefault();err.erase()}]
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
      ['.blackbox input','keyup',blackbox],
      ['.canvasName','keyup',saveCanvas],
      [window,'contextmenu', grifter],
      ['.exit','click', function (e) { cancel(e);s.push('-@edit/'+opts.id) }]
    ]
  })
  

  // MODULE DRAG+DROP
  function dragModule (e) {
    cmd = '+'+e.target.innerHTML.split('</b>')[1]
    e.dataTransfer.setData('cmd',cmd)
  }
  document.addEventListener('drop', function (e) { // symbols ◼ ψ
    cancel(e)
    cmd = null
    if (e.dataTransfer.files.length > 0) {
      upload(e, blob.cuid, function (d) { 
        s.push({key : '+$'+d.cuid+'/'+opts.id, value:blob.data})
      })
    } else cmd = e.dataTransfer.getData('cmd')
    if (cmd) s.push(cmd+'/'+opts.id)
    else return false
  },false)
  document.addEventListener('dragover', cancel, false)


  // LOGIN
  if (sessionStorage['edit']) 
    s.push('+@edit '+sessionStorage['edit']+'/'+opts.id)


  // GLOBAL KEY SHORTCUTS
  window.addEventListener('keydown', function (e) {
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
  function IO (d, enc, next) {  // USE MUXDEMUX HERE TOO!
    var self = this

    console.log(d)

    if (d.timestamp) console.log(d.timestamp)
    
    if (!lastModified && d.timestamp){ lastModified = d.timestamp; saveCanvas() }
    if (d.timestamp && d.timestamp !== lastModified) saveCanvas()

    db.write(d)

    if (d.code === 1) { // ERROR
      next() 
      if (!login.data) login.draw(JSON.parse(localStorage[opts.id]).data)
      err.draw({x : login.data.x+8, y : login.data.y + 36, msg : d.message})
      _.delay(err.erase,2200)
      return null
    } else if (!d.key) { next(); return null }

    var tkn = (d.key.split(':').length > 1) 
      ? d.key.split(':')[1]
      : d.key
  
    if (tkn && tkn === opts.id) { // smart routing or filtering carbuncle needed
      if (d.key.split(':')[0] === '@edit') { // LOGIN
        sessionStorage['edit'] = d.value
        login.erase()
        omni.draw(dx)
      } else if (d.value === '-edit') omni.erase() // LOGOUT
    } 

    next()
  }


  function saveCanvas (e) { 
    var c
    if (e && e.keyCode === 13) { // try to grab data first!
      cancel(e)
      dx.cvs = e.target.value
      db.get('?#'+e.target.value, function (d) {
        if (d instanceof Error) {
          s.push('+#'+e.target.value+'/'+opts.id)
          ps(e.target.value)
          e.target.blur()
        } else {
          s.push('!#'+e.target.value+'/'+opts.id)
          ps(e.target.value)
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

    if (e.target.className === 'canvasName') {
      d.props.push({key : '+copy', value : ''})
      editor.draw(d)
      return false
    } else if (e.target.tagName === 'HTML') { 
      db.get('?$settings', function (d) { // use this to pull canvas!
        d.props = []
        d.type = 'canvas'
        d.props.push({key:'icon',value:'/files/1x1.png'})
        editor.draw(d)
      })
    } else {
      blob = drompii(e) 

      if (!blob) return false

      _.each(blob.edit.value,function (v,k) {
        var prop = {key:k,value:v}
        d.props.push(prop)
      })

      d.name = blob.name
      d.cuid = blob.cuid
      d.rm = true
      d.reup = true
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
        blob.data[key] = val
        s.push({key : '+$'+blob.cuid+'/'+opts.id, value:blob.data})
        editor.erase()
      }
    }

    // break a function out to correctly modify the origin data

    function moldigar (toMash) {
      // receive origin + new in an object and return the mashed version
      // toMash.orig
      // toMash.nu

      return mashed
    }

  }
  function editIN (e) { if (e.keyCode === 13) cancel(e) }


  function ps (link) {
    dx.cvs = link
    if (link==='home') link = '/'
    history.pushState({'cmd':'!#'+dx.cvs},'',link)
  }


  return s
}


function cancel (e) { e.preventDefault() }

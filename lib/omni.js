var d3 = require('d3')
var D = require('./dombii.js')
var pj = require('./paper-core.js')
var asyncMap = require('slide').asyncMap
var drompii = require('./drompii.js')
var through = require('through2')
var ddx = require('./dedex.js')
var _ = require('underscore')
var path = require('path')
var fs = require('fs')

var GRIFTER = fs.readFileSync(__dirname + '/grifter.hogan', 'utf8')
var LOGIN = fs.readFileSync(__dirname + '/login.hogan', 'utf8') 
var OMNI = fs.readFileSync(__dirname + '/omni.hogan', 'utf8')

module.exports = function Omni (opts) {
  var blob = null
  var frame = null
  var frameList = null
  var svg = null
  var scale = 0.45

  delete opts.lib.env

  var dx = {
    w : window.innerWidth,
    h : window.innerHeight
  }
  dx.lib = _.values(opts.lib)
  dx.cvs = (window.location.pathname==='/@'||window.location.pathname==='/')
    ? 'untitled'
    : window.location.pathname.replace('/','')

  ps(dx.cvs)

  var s = through.obj(IO)

  window.addEventListener('popstate', function (e) {
    console.log(e)
  })

  var login = new D({ 
    template : LOGIN,
    parent : document.body,
    events : [['.login', 'submit', function (e) {
      e.preventDefault() 
      s.push('+@edit '+e.target[0].value+'/'+opts.id)
      e.target[0].value = ''
    }]]
  })

  var omni = new D({ 
    id : opts.id,
    template : OMNI,
    parent : document.body,
    events : [
      [window,'resize',setupCanvas],
      [window,'contextmenu',grifter],
      ['.canvasName','keyup',save],
      ['.canvasName','focus',function(e){ e.target.style.color = 'red' }],
      ['.canvasName','blur',function(e){ e.target.style.color = 'blue' }],
      ['.blackbox input','keyup',keyInput],
      ['.blackbox input','input',function(e){console.log(e)}],
      ['.omni','mousedown',function(e){omniDrag(e)}],
      [window,'mouseup',function(e){console.log(e);omniDrag()}],
      ['.exit','click',function(e){cancel(e);s.push('-@edit/'+opts.id)}],
      ['.exit','select',cancel]
    ]
  })

  var editor = new D({
    template : GRIFTER,
    parent : document.body,
    events : [
      ['.grifter','keyup',edit],
      ['.grifter','drop',upload],
      ['.grifter','dragenter',cancel],
      ['.grifter','dragleave',cancel],
      ['.grifter','dragover',cancel]
    ]
  })


  // EVENTS
  function IO (d, enc, next) {
    if (d.code === 1) { 
      next() 
      login.draw({err : true, msg : d.message})
      return null
    } else if (!d.key) { 
      next() 
      return null 
    }

    var tkn = (d.key.split(':').length > 1) 
      ? d.key.split(':')[1]
      : d.key
  
    if (tkn && tkn === opts.id) {
      if (d.key.split(':')[0] === '@edit') { 
        sessionStorage['edit'] = d.value
        login.erase()
        omni.draw(dx, setupCanvas)
        document.body.setAttribute('class','editing')
      } else {
        if (d.value === '-edit') {
          omni.erase() 
          document.body.setAttribute('class', null)
        } else { 
          _.defer(function () { drawBones(d) })
          console.log(_.keys(d.value))
          console.log(frameList)
          if (_.keys(d.value) !== frameList) {
            save()
            frameList = _.keys(d.value)
          } else frameList = _.keys(d.value)
        }
      }
    }

    next()
  }

  function setupCanvas (e) {
    var bounds = [window.innerWidth*scale, window.innerHeight*scale]

    var br = 358
    var svgWidth = 388
    var svgHeight = window.innerHeight - 56

    var boxes = null
    var jacks = null
    var dots = null
    var cmd

    document.addEventListener('dragover', cancel, false)
    document.addEventListener('drop', function (e) {
      cancel(e)
      console.log('MAKE')
      var cmd = e.dataTransfer.getData('cmd')
      if (cmd) s.push(cmd+'/'+opts.id)
      else return false
    })

    _.each(document.querySelectorAll('.lib li'), function (el) {
      el.addEventListener('dragstart', function (e) {
        cmd = '+'+e.target.querySelector('span').innerHTML
        e.dataTransfer.setData('cmd',cmd)
      }, false)
    })

    if (!svg) {
      svg = d3.select('#cvs').append('svg')
              .attr('height', svgHeight)
              .attr('width', svgWidth)

      svg.append('svg:rect') // background
        .attr('x',15)
        .attr('y',15)
        .attr('width',br)
        .attr('height',bounds[1])
        .attr('fill', 'transparent')
        .attr('stroke','rgba(241,241,241,0.2)')
    } else if (svg) {
      svg.attr('height', svgHeight)
      d3.select('rect')
        .attr('height',bounds[1])
    }

    if (frame) drawBones(frame)
  }

  function drawBones (d) { 
    frame = d

    var canvas = d.value

    d3.selectAll('text').remove()

    for (item in canvas) {
      var center 

      if (document.getElementById(item)) {
        var div = document.getElementById(item).firstChild
        center = [
          ((div.offsetWidth/2) + div.offsetLeft) * scale,
          (((div.offsetHeight/2) + ((div.offsetTop-56))) * scale)+56
        ]
      }

      svg.append('svg:text')
        .text(canvas[item].name.toUpperCase())
        .attr('x',center[0])
        .attr('y',center[1])
        .attr('fill','#f1f1f1')
        .attr('font-size','9px')
    }
  }

  function omniDrag (ev) {
    if (ev && ev.target.className==='omni') {
      var top = ev.pageY - ev.target.offsetTop
      var left = ev.pageX - ev.target.offsetLeft
      document.onmousemove = function (e) {
        dx.y = e.pageY-top+'px'
        dx.x = e.pageX-left+'px'
        omni.draw(dx)
        e.preventDefault()
      }
      ev.preventDefault()
    } else document.onmousemove = null
  }

  function toggleLib (e) {
    cancel(e)
    if (dx.showlib) {
      dx.showlib = false
      e.target.style.background = 'transparent'
    }
    else {
      dx.showlib = true
      e.target.style.background = '#FAFAFA'
    }
    omni.draw(dx)
  }
  
  function toggleCanvas (e) {
    dx.w = window.innerWidth
    dx.h = window.innerHeight
    e.preventDefault()
    if (dx.bones !== 'block') {
      dx.bones = 'block'
      omni.draw(dx)
      if (frame) _.defer(function(){drawBones(frame)})
    } else {
      dx.bones = null
      omni.draw(dx)
    }
  }

  function keyInput (e) {
    var val = e.target.value.replace(' ','')
    if (e.keyCode === 13 || e.key === 'Enter') {
      e.preventDefault()
      e.target.value = ''
      s.push(val+'/'+opts.id)
    } 
  }

  function save (e) { // SAVING!
    if (e && e.keyCode === 13) {
      ps(e.target.value)
      e.target.blur()
      var c = '+#'+window.location.pathname.replace('/','')
      console.log(c)
    } else if (!e) {
      var c = '+#'+window.location.pathname.replace('/','')
      console.log(c)
    }
  }


  // CONTEXT / EDIT
  function grifter (e) {
    e.preventDefault()

    if (e.target.parentNode.class === 'lib') {
      console.log(e.target.innerHTML) // modify!
      return false
    } 

    blob = drompii(e)

    editor.erase()

    var dx = {
      x : e.pageX-10,
      y : e.pageY-10,
      body : _.values(blob.edit)[0].replace(/[\n\r]/g,'')
    }

    if (dx.body.length > 140) { dx.w = 400; dx.h = 300 }

    switch (blob.type) {
      case 'SPAN' : editor.draw(dx);break;
      case 'IMG' : editor.draw(dx);break;
    }
  }

  function edit (e) { 
    if (e.keyCode === 13) {
      e.preventDefault()
      var body = e.target.value.replace(/[\n\r]/g,'')
      blob.data[_.keys(blob.edit)[0]] = body
      s.push({key:'+$'+blob.id,value:blob.data})
      editor.erase()
      return false
    }
  }

  function upload (e) {
    cancel(e)

    var files = e.dataTransfer.files

    if (blob.type !== 'IMG') 
      return false

    for (file in files) {
      if (file === 'length') return

      if (files[file] && files[file].type) 
        var fileName=files[file].name.replace(/[^a-z0-9]/gi,'_').toLowerCase()

      var filepath = null
      var ndata = {}

      var formData = new FormData()
      formData.append('file', fileName)
      formData.append('token', 'test123') 

      var xhr = new XMLHttpRequest()
      xhr.upload.addEventListener('error',function(e){console.error(e)},false) 
      xhr.upload.addEventListener('load', function (e) {
        s.push({key : '+$'+ndata.id, value : ndata.data})
      },false) 
      xhr.upload.addEventListener('progress', function (e) { 
        var prog = (e.loaded/e.total) * 100
        editor.data.body = 'Uploading : ' + prog.toFixed(2) + '%'
        editor.draw()
        if (e.loaded === e.total) editor.erase()
        else if (e.total === 0) editor.erase()
      },false) 
      xhr.open('post','/upload',true) 

      var reader = new FileReader()
      reader.readAsDataURL(files[file])
      reader.addEventListener('load', function (data) {
        filePath = '/files/'+fileName
        formData.append('blob', data.target.result)
        editoj.erase()
        if (data.target.result.split('/')[0] === 'data:image') {
          var img = new Image()
          img.src = data.target.result
          img.addEventListener('load',function (e) {
            blob.edit.w = e.target.width
            blob.edit.h = e.target.height
            blob.edit.src = '/files/'+fileName
            _.each(blob.edit, function (v,k,l) {
              if (blob.data[k]) blob.data[k] = v
            })
            _.each(blob, function (v,k,l) { ndata[k] = v })
          },false)
        }
        xhr.send(formData)
      }, false)
    }
  }

  if (sessionStorage['edit']) 
    s.push('+@edit '+sessionStorage['edit']+'/'+opts.id)

  if (!sessionStorage['edit'])
    login.draw({err:false})

  return s
}


// HELPERS

function ps (link) {
  if (!link) return window.location.pathname.replace('/','')
  history.pushState({'cmd':'!#'+link},'',link)
}

function cancel (e) { 
  e.preventDefault() 
}

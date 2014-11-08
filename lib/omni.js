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
  
  var blob 
  var frame
  var svg
  var scale = 0.45

  var dx = {
    w : window.innerWidth,
    h : window.innerHeight
  }
  dx.lib = _.values(opts.lib)

  dx.cvs = (window.location.pathname==='/@' || window.location.pathname==='/')
     ? 'untitled'
     : window.location.pathname.replace('/','')

  var s = through.obj(function Interface (d, enc, next) {

    if (d.code === 1) { 
      next() 
      login.draw({err:true, msg:d.message})
      document.body.querySelector('#login').focus()
      return null
    } else if (!d.key) { 
      next(); 
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
          process.nextTick(function () { drawBones(d) })
        }
      }
    }
    next()
  })


  // UI
  
  function setupCanvas (e) {

    var bounds = [window.innerWidth*scale, window.innerHeight*scale]
    var cmd

    var svgWidth = 358
    var svgHeight = window.innerHeight - 30

    document.addEventListener('dragover', cancel, false)
    document.addEventListener('drop', function (e) {
      cancel(e)
      if (cmd) {
        s.push(cmd+'/'+opts.id)
      }
    })

    _.each(document.querySelectorAll('.lib li'), function (el) {
      el.addEventListener('dragstart', function (e) {
        cmd = '+'+e.target.innerHTML
      }, false)
    })

    if (!svg) {
      svg = d3.select('#cvs').append('svg')
              .attr('width', svgWidth)
              .attr('height', svgHeight)

      svg.append('svg:rect') // background
        .attr('x',15)
        .attr('y',15)
        .attr('width',bounds[0])
        .attr('height',bounds[1])
        .attr('fill', 'transparent')
        .attr('stroke','rgba(241,241,241,0.2)')
    } else if (svg) {
      svg.attr('width', svgWidth)
      svg.attr('height', svgHeight)
      d3.select('rect')
        .attr('width',bounds[0])
        .attr('height',bounds[1])
    }

    if (frame) drawBones(frame)
    
    var boxes = null
    var jacks = null
    var dots = null
  }

  function drawBones (d) { // draw visualization
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


  // TEMPLATES
  
  var login = new D({ 
    template : LOGIN,
    parent : document.body,
    events : [['.login','submit',function (e) {
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
      [window,'keydown',function(e){if(e.keyCode===27)toggleCanvas(e)}],
      ['.blackbox input','keyup',keyInput],
      ['.xray','click',toggleCanvas],
      ['.xray','select',cancel],
      ['.pallette','click', toggleLib],
      ['.exit','select',cancel],
      ['.exit','click',function(e){cancel(e);s.push('-@edit/'+opts.id)}]
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
  
  function toggleLib (e) {
    cancel(e)
  }
  
  function toggleCanvas (e) {
    dx.w = window.innerWidth
    dx.h = window.innerHeight
    e.preventDefault()
    if (dx.bones !== 'block') {
      dx.bones = 'block'
      omni.draw(dx)
      if (frame) process.nextTick(function(){drawBones(frame)})
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


  // CONTEXT / EDIT
  
  function grifter (e) {
    e.preventDefault()
    blob = drompii(e)
    editor.erase()

    var dx = {
      x : e.pageX-10,
      y: e.pageY-10,
      body: _.values(blob.edit)[0].replace(/[\n\r]/g,'')
    }

    if (dx.body.length>140) { dx.w = 400; dx.h = 300 }

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

      var filepath
      var ndata = {}
      var formData = new FormData()
      formData.append('file', fileName)
      formData.append('token', 'test123') 

      var xhr = new XMLHttpRequest()
      xhr.upload.addEventListener('error',function(e){console.error(e)},false) 
      xhr.upload.addEventListener('load', function (e) {
        s.push({key:'+$'+ndata.id,value:ndata.data})
      }, false) 
      xhr.upload.addEventListener('progress', function (e) { 
        var prog = (e.loaded/e.total) * 100
        editor.data.body = 'Uploading : ' + prog.toFixed(2) + '%'
        editor.draw()
        if (e.loaded === e.total) editor.erase()
        else if (e.total === 0) editor.erase()
      }, false) 
      xhr.open('post', '/upload', true) 

      var reader = new FileReader()
      reader.readAsDataURL(files[file])
      reader.addEventListener('load', function (data) {
        filePath = '/files/'+fileName
        formData.append('blob', data.target.result)
        editor.erase()
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

  if (!sessionStorage['edit']) {
    login.draw({err:false})
    document.body.querySelector('#login').focus()
  }

  return s
}

function cancel (e) { 
  e.preventDefault() 
}

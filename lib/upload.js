var D = require('./dombii.js')

var STATUS = require('fs').readFileSync(__dirname+'/status.hogan','utf8')

module.exports = function (e, cb) { // could be a stream or emitter?
  e.stopPropagation()
  e.preventDefault()

  var stats = new D({
    parent : document.body,
    template : STATUS
  })

  var files = e.dataTransfer.files

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
      cb(ndata)
      setTimeout(function(){stats.erase()},800)
    },false) 
    xhr.upload.addEventListener('progress', function (e) {// how to tap into this?
      var prog = (e.loaded/e.total) * 100
      var msg = 'Uploading : '+ndata.src+' - '+prog.toFixed(2)+'%'
      console.log(msg)
      stats.draw({msg:msg})
    },false) 
    xhr.open('post','/upload',true) 

    var reader = new FileReader()
    reader.readAsDataURL(files[file])
    reader.addEventListener('load', function (data) {
      filePath = '/files/'+fileName
      formData.append('blob', data.target.result)
      if (data.target.result.split('/')[0] === 'data:image') {
        var img = new Image()
        img.src = data.target.result
        img.addEventListener('load',function (e) {
          ndata.w = e.target.width
          ndata.h = e.target.height
          ndata.src = '/files/'+fileName
        },false)
      }
      xhr.send(formData)
    }, false)
  }
}

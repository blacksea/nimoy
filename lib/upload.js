var D = require('./dombii.js')

var STATUS = require('fs').readFileSync(__dirname+'/status.hogan','utf8')

module.exports = function (e, dblob, cb) { // could be a stream or emitter?
  e.stopPropagation()
  e.preventDefault()

  var stats = new D({
    parent : document.body,
    template : STATUS
  })

  var files = e.dataTransfer.files


  var xhr = new XMLHttpRequest()
  xhr.upload.addEventListener('error',function(e){ console.error(e)}, false) 
  xhr.open('post','/upload',true) 

  var formData = new FormData()
  for (var i=0;i<files.length;i++) {
    if (files[i] === 'length') return

    if (files[i] && files[i].type) 
      var fileName=files[i].name.replace(/[^a-z0-9_.\-]/gi,'_').toLowerCase()

    var filepath = null
    var ndata = {}

    var selection = e.target.nextSibling.innerHTML

    formData.append('file', files[i])

    xhr.addEventListener('load', function (e) {
      if (dblob) {
        console.log(ndata)
        if (typeof dblob.edit.index === 'number') {
          for (p in ndata) {
            if (dblob.edit.value[p]) dblob.edit.value[p] = ndata[p]
          }
          dblob.data[dblob.edit.key][dblob.edit.index] = dblob.edit.value 
        } else if (!dblob.edit.index) {
          dblob.data[dblob.edit.key] = ndata[dblob.edit.key]
        }
        cb(dblob)
      } 
      // if no dblob create file reference? store files markers in db?
      setTimeout(function(){stats.erase()},800)
    },false) 
    xhr.upload.addEventListener('progress', function (e) { // how to tap into this?
      var prog = (e.loaded/e.total) * 100
      var msg = 'Uploading : '+fileName+' - '+prog.toFixed(2)+'%'
      stats.draw({msg:msg})
    },false) 

    var reader = new FileReader()
    reader.readAsDataURL(files[i])
    reader.addEventListener('load', function (data) {
      filePath = '/files/'+fileName
      ndata[selection] = filePath
      formData.append('blob', data.target.result)
      if (data.target.result.split('/')[0] === 'data:image') {
        var img = new Image()
        img.src = data.target.result
        img.addEventListener('load',function (e) {
          ndata.w = e.target.width
          ndata.h = e.target.height
        },false)
      }
    }, false)
    xhr.send(formData)
  }
}

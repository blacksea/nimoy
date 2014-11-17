module.exports = function (e) { // could be a stream or emitter?
  cancel(e)

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
      s.push({key : '+$'+ndata.id, value : ndata.data})
      // this should just fire callback
    },false) 
    xhr.upload.addEventListener('progress', function (e) { 
      // how to tap into this?
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

          // how to not rely on blob!!!!
          // modify the blob in grifter and then provide a cb

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

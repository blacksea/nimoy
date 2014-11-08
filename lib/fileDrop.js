var through = require('through')

module.exports = function (fileDrop) {

  fileDrop.addEventListener('drop', fileUpload, false)
  fileDrop.addEventListener('dragenter', cancel, false)
  fileDrop.addEventListener('dragleave', function (e) {
    cancel(e)
    element.style.background = 'blue'
  }, false)
  fileDrop.addEventListener('dragover', function (e) {
    cancel(e)
    element.style.background = 'red'
  }, false)

  function cancel (e) { 
    e.preventDefault() 
    if (e.stopPropogation) e.stopPropogation() 
  }

  function fileUpload (e) {
    cancel(e)
    var files = e.dataTransfer.files
    for (file in files) {
      if (file === 'length') return

      var fileName = files[file].name

      var formData = new FormData()
      formData.append('file', fileName)
      formData.append('token', 'test123')

      var xhr = new XMLHttpRequest()
      xhr.open('post', '/upload', true) 
      xhr.addEventListener('error', function (e) { console.error(e) }, false) 
      xhr.addEventListener('progress', function (e) { 
        s.emit('data', e)
      }, false) 

      var reader = new FileReader()
      reader.readAsDataURL(files[file])
      reader.addEventListener('load', function (data) {
        formData.append('blob', data.target.result)
        xhr.send(formData)
      }, false)
    }
  }

  var s = through(function Write (el) {
    if (el.tagName) {
      var parent = el.parentElement
      parent.removeChild(el)
      fileDrop.draw(parent)
    }
  }, function End () { this.emit('end') })

  return s
}


// browser code!

window.addEventListener('load', function () {
  document.body.addEventListener('DOMNodeInserted', function (e) {
    console.log(e.target.outerHTML)
  },false)
  var div = document.createElement('div')
  div.innerHTML = 'bongo'
  document.body.appendChild(div)
  console.log(window.location)
},false)



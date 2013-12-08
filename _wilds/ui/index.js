// UI ELEMENTS with PAPERJS

var paperJS = document.createElement('script')
paperJS.setAttribute('src','./paper.min.js')

var cvs = document.createElement('canvas')
cvs.width = document.client.width
cvs.height = document.client.height

var body = document.body
body.appendChild(cvs)

paperJS.onload = function () {
  console.log(paper)
  paper.setup(cvs)
}

var fern = require('./index.js')

function fA (arg, cb) {
  var x = arg + 3
  cb(x)
}

function fB (arg, cb) {
  var x = arg + 2
  cb(x)
}

function fC (arg, cb) {
  var x = arg * 4
  cb(x)
}

var arr = [
  [fA, 5],
  fB,
  fC
]

fern(arr, function (res) {
  console.log(res)
})

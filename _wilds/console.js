/*{
  "id":"console",
	"scope":["client"],
	"desc":"cli",
  "deps":["console.html","console.styl"]
}*/
var telepath = require('tele')

module.exports = function () {
  var self = this
  telepath(this)

  this.recv = function (buffer) {
    var data = JSON.parse(buffer.toString())
    console.dir(data)
  }

  setInterval(function () {
    self.send({test:Math.random()})
  }, 300)

  // this.template = null;
  // this.output = new Stream();

  // this.init = function () {

  //   var container = document.getElementById('container')
  //   , log = document.createElement('div');

  //   log.setAttribute('id','console');
  //   log.innerHTML = self.template;

  //   container.appendChild(log);

  //   var form = document.getElementById('x')
  //   , prompt = form.querySelector('.console');

  //   form.onsubmit = function (e) {
  //     e.preventDefault();
  //     var cmd = e.target[0].value; // entered text
  //     self.output.emit('data',cmd);
  //     prompt.blur();
  //   }
  //   
  //   prompt.onfocus = function () {
  //     prompt.value = '';
  //   }

  //   prompt.onblur = function () {
  //     prompt.value = '>';
  //   }
  // }

  // this.output.on('data', function (data) {
  //   console.dir(data);
  // });
}

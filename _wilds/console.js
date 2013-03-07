/*{
  "id":"console",
	"scope":["client"],
	"desc":"cli",
  "deps":["console.html","console.styl"]
}*/

var Stream = require('stream');

module.exports = function () {

  var self = this;
  this.template = null;
  this.output = new Stream();

  this.init = function () {

    var container = document.getElementById('container')
    , log = document.createElement('div');

    log.setAttribute('id','console');
    log.innerHTML = self.template;

    container.appendChild(log);

    var form = document.getElementById('x')
    , prompt = form.querySelector('.console');
    console.dir(prompt);

    form.onsubmit = function (e) {
      e.preventDefault();
      var cmd = e.target[0].value; // entered text
      self.output.emit('data',cmd);
      prompt.blur();
    }
    prompt.onblur = function () {
      prompt.value = '';
    }
  }

}

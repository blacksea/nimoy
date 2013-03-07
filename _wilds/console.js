/*{
  "id":"console",
	"scope":["client"],
	"desc":"cli",
  "deps":["console.html","console.styl"]
}*/

module.exports = function () {

  var self = this;
  this.template = null;

  this.init = function () {
    var container = document.getElementById('container');
    var log = document.createElement('div');
    log.setAttribute('id','console');
    log.innerHTML = self.template;
    container.appendChild(log);
    var form = document.getElementById('x');
    form.onsubmit = function (e) {
      e.preventDefault();
      console.dir(e.target[0].value);
      return false;
    }
    console.dir(form);
  }

  this.input = function (data) {
  }

  this.output = function (data) {
  }

}

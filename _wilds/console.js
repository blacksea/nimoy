/*{
  "id":"console",
	"scope":["client"],
	"desc":"cli",
  "deps":["console.html","console.styl"]
}*/

var _ = Object._;

module.exports = function () {

  var self = this;
  this.template = null;

  this.init = function () {
    var container = document.getElementById('container');
    var log = document.createElement('div');
    log.innerHTML = self.template;
    container.appendChild(log);
  }

  this.input = function (data) {
  }

  this.output = function (data) {
  }

}

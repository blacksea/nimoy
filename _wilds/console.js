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

  this.test = function () {
    console.log(self.template);
  }

  this.input = function (data) {
  }

  this.output = function (data) {
  }

}

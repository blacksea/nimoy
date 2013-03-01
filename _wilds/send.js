/*{
  "id":"send",
	"scope":["client","server"],
	"desc":"information"
}*/

var _ = Object._;

module.exports = function () {
  // default input function
  var self = this;
  this.test = function () {
    console.log('send called!!!!!!');
  }
  this.input = function (data) {
  }
  this.output = function (data) {
  }
  // default output function
}

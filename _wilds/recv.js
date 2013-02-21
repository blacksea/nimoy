/*{
  "id":"recv",
	"scope":["client","server"],
	"desc":"send data"
}*/

var _ = Object._;

module.exports = function () {
  setTimeout(function() {
    Object._.send.test();
  }, 3000);
  var self = this;
}

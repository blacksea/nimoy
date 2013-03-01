/*{
  "id":"recv",
	"scope":["client","server"],
	"desc":"send data"
}*/

var _ = Object._;

module.exports = function () {
  var self = this;
  setTimeout(function() {
    _.send.test();
  }, 3000);
}

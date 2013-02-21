/*{
  "id":"send",
	"scope":["client","server"],
	"desc":"information"
}*/
// meta for bricoleur to read in

var _ = Object._;

module.exports = function () {
  var self = this;
  this.test = function () {
    console.log('send called!!!!!!');
  }
}

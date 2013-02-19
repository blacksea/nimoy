/*{
  "id":"core",
	"scope":["client"],
	"desc":"information"
}*/
// C O R E
var shoe = require('shoe')
, bus = shoe('bus')
, bricoleur = require('../_brico');

// get a map ... call brico init somehow...

var brico = new bricoleur();
bus.pipe(brico.stream).pipe(bus);
module.exports = function () {
  var self = this;
}

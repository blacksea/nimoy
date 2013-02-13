/*{
  "id":"core",
	"scope":["client"],
	"desc":"information"
}*/

// C O R E

var shoe = require('shoe')
, bus = shoe('bus')
, bricoleur = require('../_brico');

var brico = new bricoleur();
bus.pipe(brico.stream).pipe(bus);


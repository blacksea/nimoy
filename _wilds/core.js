/*{
  "id":"core",
	"scope":"client",
	"desc":"information"
}*/

var shoe = require('shoe')
, bus = shoe('bus')
, bricoleur = require('../_brico');

var brico = new bricoleur();
bus.pipe(brico.stream).pipe(bus);


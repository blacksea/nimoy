/* R O U T E R 
 handle req's
*/
var filed = require('filed');
module.exports = function (req, res) {
  if (req.url==='/bundle.min.js') {
    filed('_wilds/bundle.min.js').pipe(res);
  } else if (req.url==='/') { 
    filed('_wilds/frame.html').pipe(res);
  } else {
    res.end('fuuuuuuk');
   }
}

/* R O U T E R 
 handle req's
*/
var filed = require('filed');
module.exports = function (opts) {
  this.handleRoutes = function (req,res) {
    for(url in opts){
      var match = false;
      if(url === req.url) {
        filed(opts[url]).pipe(res);
        match = true;
        break;
      } else if(url != req.url) match = false;
    }
    if (match === false) res.end('fuuuuuk');
  }
}

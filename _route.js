// R O U T E R 
var filed = require('filed');
module.exports = function (routes) {
  this.handleRoutes = function (req,res) {
    var match = false;
    for (var i=0;i<routes.length;i++) {
      var route = routes[i];
      if(route.url === req.url) {
        filed(route.file).pipe(res);
        match = true;
        break;
      } else if(route.url != req.url) {
        match = false;
      }
    }
  if (match === false) res.end('fuuuuuk');
  }
}

// ROUTER 

var filed = require('filed')
, async = require('async');

module.exports = function (routes) {

  this.handleRoutes = function (req,res) {

    var match = false;

    async.forEach(routes, function (route, cb) {
      if(route.url === req.url) {
        filed(route.file).pipe(res);
        match = true;
      }
      cb();
    }, function () {
      if (match===false) res.end('404'); 
    });
  }
}

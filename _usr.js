// USER 

module.exports = function () {
  var self = this;
  this.def = {
    routes:[
      {url:"/",
      file:"./_wilds/_index.html"},
      {url:"/_bundle.min.js",
      file:"./_wilds/_bundle.min.js"},
      {url:"/_styles.css",
      file:"./_wilds/_styles.css"}
    ],
    modules:['data']
  }
}

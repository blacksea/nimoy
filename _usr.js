// USER 

module.exports = function () {
  var self = this;
  this.def = {
    routes:[
      {url:"/",
      file:"./_wilds/_index.html"},
      {url:"/_scripts.min.js",
      file:"./_wilds/_scripts.min.js"},
      {url:"/_styles.css",
      file:"./_wilds/_styles.css"}
    ],
    modules:['data']
  }
}

// USER 

module.exports = function () {
  var self = this;
  this.def = {
    routes:[
      {url:"/",
      file:"./_wilds/frame.html"},
      {url:"/bundle.min.js",
      file:"./_wilds/bundle.min.js"},
      {url:"/styles.css",
      file:"./_wilds/styles.css"}
    ],
    modules:['data']
  }
}

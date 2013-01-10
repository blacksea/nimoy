var fs = require('fs'),
async = require('async'),
_ = require('underscore');

var Make = function () {
  var p = this;
  p.rootDir = null;
  p.destJS = null;
  p.destCSS = null;
  p.destHTML = null;
  p.srcDIR = '';
  p.templateHTML = {};

  p.set = function (settings) {
    // accept an object
    switch (option) {
      case 'path' : p.rootDir = value; break;
    }
  }

  p.build = function (callback) { 
    // remove old css + js 
    function purgeOLD(cb) {
      fs.unlink(p.destJS, function () {
        fs.writeFile(p.destJS, '', function() {
          fs.unlink(p.destCSS, function () {
            fs.writeFile(p.destCSS, '', function () {
              cb();
            }); 
          });
        });
      });
    }

    purgeOLD(function () {
      fs.readdir(p.srcDIR, function (err, contents) {
        async.forEach(contents, function (template, cb) { // new unpackagr
          var unpak = new unPakager(template);
          unpak.load(function(){
            cb();
          });
        }, function () {
          callback();
        });
      });
    });
  }

  p.makeComplete = function() {}

  // package reader class
  var unPakager = function (template) {

    var name = template;

    this.load = function (cb) {
      var path = p.srcDIR+'/'+name+'/';
      var infoFile = path+'package.json';   
      fs.readFile(infoFile, function (err, data) {
        var json = data.toString(),
        packageObj = JSON.parse(json);  
        handleData(path, packageObj, function(){
          cb(); // print data
        });
      });
    }

    function handleData (path, data, callback) {
      var contentsLength = _.size(data.contents);
      var count = 0;
      for (var dataType in data.contents) {
        var file = path+data.contents[dataType];
        switch(dataType) {
          case 'html': handleHTML(file); break; 
          case 'css' : handleCSS(file); break;
          case 'js'  : handleJS(file); break;
        }
      } 

      function handleHTML (file) {
        fs.readFile(file, function (err, contents) {
          p.templateHTML[name] = contents.toString();
          progress();
        });
      }
    
      function handleCSS (file) { // separate modules css / delete + compile
        fs.readFile(file, function (err, contents) {
          fs.appendFile(p.destCSS, contents.toString()+'\n\n', function (err) {
            progress();
          });
        });
      }
    
      function handleJS (file) {
        fs.readFile(file, function (err, contents) {
          fs.appendFile(p.destJS, contents.toString()+'\n\n', function (err) {
            progress();
          });
        });
      }
    
      function progress () {
        count++;
        if(count==contentsLength){
          callback();
        }
      }
    
    }
  }
}

var make = new Make;
exports = module.exports = make;
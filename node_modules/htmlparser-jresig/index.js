var fs = require('fs');

// Read and eval library
filedata = fs.readFileSync(__dirname + '/htmlparser-lib/htmlparser.js', 'utf8');
eval(filedata);

exports.HTMLParser = HTMLParser;
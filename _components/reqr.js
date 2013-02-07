// R E Q R
console.log(req.url);
if(req.url==='/bundle.min.js'){
filed('_components/public/bundle.min.js').pipe(res);
}
else if (req.url==='/'){
filed('_components/public/frame.html').pipe(res);
}
else {
res.end('fuuuuuuk');
 }

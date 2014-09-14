// BROWSER TESTS!

var through = require('through2')

// just run through commands
// and use somekind of external thing to do ui
// load a ui test module here and stream the output

var cmds = [ // no objects 
  {cmd:'+@edit nimoy', from:'auth'},
  {cmd:'+mod1', from:'addMod1'},
  {cmd:'+mod2', from:'addMod2'},
  {cmd:'?mod2', from:'findMod2'}
]

module.exports = function ClientTest (opts) {
  console.log('nuglet')

  var s = through.obj(function (d,enc,next) {

    next()
  })
 
  return s
}

// test('BRICOLEUR STREAMING API', function (t) {
//   var pipe, m1, m2
// 
//   var tests = {
//     auth : function (d) {
//       t.equal(isCuid(d.value),true, 'auth succesfull')
//     },
//     addMod1 : function (d) {
//       t.equal(isCuid(d.value), true, 'placed module1')
//       m1 = d.value
//     },
//     addMod2 : function (d) {
//       t.equal(isCuid(d.value), true, 'placed module2')
//       m2 = d.value
//     },
//     findMod2 : function (d) {
//       t.equal(d.value instanceof Array, true, 'search complete')
//       brico.write({cmd:'+'+m1+'|'+m2,from:'pipe'})
//     },
//     pipe : function (d) {
//       pipe = d.value
//       t.equal(isCuid(pipe),true, 'piped modules')
//       brico.write({cmd:'+#cvs',from:'save'})
//     },
//     save : function (d) {
//       t.equal(d.value,'#:cvs', 'saved')
//       brico.write({cmd:'!#cvs',from:'load'})
//     },
//     load : function (d) {
//       t.equal(d.value,'#:cvs', 'loaded')
//       brico.write({cmd:'-'+pipe,from:'unpipe'})
//     },
//     unpipe : function (d) {
//       t.equal(d.value,pipe, 'unpiped modules')
//       brico.write({cmd:'-@edit',from:'logout'})
//     },
//     logout : function (d) {
//       t.equal(d.value, 'edit', 'logged out')
//     }
//   }
// 
//   t.plan(_.keys(tests).length)
// 
//   cmds.forEach(function (c) {
//     brico.write(c)
//   })
// 
//   brico.on('data', function (d) {
//     var path = d.key.split(':')
//     var k = path[path.length-1]
//     tests[k](d)
//   })
// })

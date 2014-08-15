var manifest = require('./static/manifest.json')
var config = require('./bricoleurConfig.json') // setlib!

var db = require('multilevel').client(manifest)
           .on('error', Errs)

var engine = require('engine.io-stream')
var ws = engine('/ws')
ws.pipe(db.createRpcStream()).pipe(ws)

var canvas = (!window.location.hash) 
  ? {key: 'canvas:open', value:'default'}
  : {key: 'canvas:open', value:window.location.hash.slice(1)}

var user = (window.location.host.split('.').length === 3)
  ? window.location.host.split('.')[0]
  : 'default'

var bricoleur = require('./_bricoleur')(db, user, config)
                  .on('error', Errs)

bricoleur.write(canvas)
        
window.addEventListener('hashchange', function (e) {
  e.preventDefault()
  canvas.value = e.newURL.split('#')[1]
  bricoleur.write(canvas)
}, false)

if (sessionStorage[user])// place login in here!
  bricoluer.write({
    name: user,
    session: sessionStorage[user]
  })
if (!sessionStorage[user] && user !== 'default') {
  document.body.appendChild(login)
}

// login

var login = document.createElement('div')
login.className = 'login'
login.innerHTML = '<form id="loginForm">'
  + '<input type="password" placeholder="enter password" />'
  + '<input type="submit" value="edit" style="display:none;" />'
  + '</form>'

login.querySelector('#loginForm')
  .addEventListener('submit', function (e) {
    bricoluer.write({
      name: user,
      pass: e.value[0]
    })
  }, false)

function Errs (err) { console.error(err) } // wha...!!!

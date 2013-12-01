// BRICO

function format (d) {
  var m = {
    id: d.id,
    from:d.from[0].address, 
    fromName:d.from[0].name, 
    date:d.date.getDate()+'/'+d.date.getMonth()+'/'+d.date.getFullYear(),
    time:d.date.getHours()+':'+d.date.getMinutes(),
    to:d.to[0].address,
    subject:d.subject,
    text:d.text,
    UA:d.messageId
  }
  return m
}

var mailparser = require('mailparser').MailParser
var inbox = require('inbox')
var async = require('slide').asyncMap
var ev = require('events')
var mp = new mailparser()

var imap = new ev.EventEmitter()
var client = null
var FORMAT = 'filtered'
var UID = null

imap.connect = function (opts) {
  if (opts.format) FORMAT = opts.format

  client = inbox.createConnection(false, "imap.gmail.com", {
    secureConnection: true,
    auth:{
      user: opts.user,
      pass: opts.pass
    }
  })

  client.connect()

  client.on('connect', function(){
    imap.emit('connection', null) // notify!
    var uid = null
    client.openMailbox('INBOX',{readOnly:true},function(error, info){
      if(error) throw error 
    })
    client.on('new', function(env) {
      var mp = new mailparser()
      uid = env.UID
      client.createMessageStream(env.UID).pipe(mp)
      mp.on('end', function handleMsg (msg) {
        msg.date = new Date(env.date)
        msg.id = env.UID
        if (FORMAT==='filtered') msg = format(msg)
        imap.emit('msg', msg)
      })
    })
  })
}   

imap.getAll = function (cb) {
  client.openMailbox('INBOX', {readOnly:true}, function (e,info) {
    if (e) cb(e)
    client.listMessages(0,0,function handleMssgs (e,mssgs) {
      if (e) cb(e)
      async(mssgs, function getMssg (env,callback) {
        mp = new mailparser()
        client.createMessageStream(env.UID).pipe(mp)
        mp.on('end', function rtrnMssgData (msg) {
          msg.date = new Date(env.date)
          msg.id = env.UID
          if (FORMAT==='filtered') msg = format(msg)
          imap.emit('msg', msg)
          callback()
        })
      }, function () {
        cb(null)
      })
    })
  })
}

module.exports = imap

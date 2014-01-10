// BRICO
// 
var nodemailer = require('nodemailer')
var inbox = require('inbox')
var mailparser = require('mailparser').MailParser
var asyncMap = require('slide').asyncMap

// hack togethert a simpler imap & smtp lib

var user
var pass
var host

var transport = nodemailer.createTransport("SMTP", {
    host: host,
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user:user,
        pass:pass
    }
})

var msg = {
  from:'',
  to: '',
  subject:'',
  text:''
}

transport.sendMail(msg, function (e,res) {
  if (e) console.error(e)
  if (!e) console.log(res)
})


var client = inbox.createConnection(false, "imap.gmail.com", {
  secureConnection: true,
  auth:{
    user: user,
    pass: pass
  }
})
client.connect()

client.on('connect', function () {
  console.log('connected')
  client.openMailbox('INBOX', {readOnly:true}, function (e, info) {
    if (e) console.error(e)

    var count = info.count
    var done = false

    start = 3000
    end = 4674
    done = true

    function getBundle () {
      client.listMessages(start, end, function handlemssgs (e ,mssgs) {
        if (e) console.error (e)
        asyncMap(mssgs, parse, function () {
          if (end == count ) {
            console.log('done bundle')
            done = true
          }
          if (done == false) {
            start += bundleSize
            end += bundleSize
            if (end > count) end = count
            console.log('getting next bundle')
            getBundle()
          }
          if (done == true) console.log('all messages saved!')
        })
      })
    }

    function parse (env, next) {
      var mp = new mailparser()
      client.createMessageStream(env.UID).pipe(mp)
      mp.on('end', function rtrnMssgData (msg) {
        msg.date = new Date(env.date)
        msg.id = env.UID
        msg = format(msg)
        var key = user+':'+msg.from+':'+msg.date+':'+msg.id
        var val = JSON.stringify(msg)

        // emit msg

      })
    }

    getBundle()
  })
})

function format (d) {
  if (!d.to) d.to = 'null'
  if (!d.from) d.from = 'null'
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

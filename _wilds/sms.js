// SMS

var twilio = require('twilio')
var time = require('time')
var through = require('through')

module.exports = SMS 

function SMS (opts) {
  var client = new twilio.RestClient(opts.sid,opts.auth)
  if (!opts.pollRate) opts.pollRate = 5000
  var baseURL = '/Accounts/'+opts.sid+'/'

  function check (res) {
    var d = new Date()
    var today = d.toISOString().split('T')[0]

    client.request({
      url: baseURL+'Messages',
      qs: {DateSent:today},
      method: 'GET'
    }, function (e, resData, nodeRes) {
      if (e) s.emit('error',e)
      if (!e) res(resData.messages)
    })
  }
  
  var ms = []

  setInterval(function () {
    check(function (m) {
      if (ms.length!==m.length) {
        var origDate = new time.Date(m[0].dateSent)
        var date = origDate.setTimezone(opts.timezone)
        var msg = {
          sid: m[0].sid,
          date: date.toISOString().split('T')[0],
          time: date.toString().split(' ')[4],
          to: m[0].to,
          from: m[0].from,
          body: m[0].body,
          num_segments: m[0].num_segments,
          num_media: m[0].num_media,
          direction: m[0].direction,
          status: m[0].status
        }
        s.emit('data',msg)
        ms = m
      }
    })
  }, opts.pollRate)

  var s = through(function Send (msg) {
    client.messages.create(msg, function (e, res) {
      if (e) s.emit('error', e)
      // if (!e) console.log(res)
    })
  }, function End () {
    this.emit('end')
  })
  s.autoDestroy = false

  return s
}

var level = require('level')
, Duplex = require('stream').Duplex
, inherits = require('inherits')

inherits(Data, Duplex)

module.exports = Data

function Data (opts) {
  if (!(this instanceof Data)) return new Data(opts)
  Duplex.call(this)
  var self = this
}

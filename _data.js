var level = require('level')
, Duplex = require('stream').Duplex
, util = require('util')

util.inherits(Data, Duplex)

module.exports = Data

function Data (opts) {
  if (!(this instanceof Data)) return new Data(opts)
  Duplex.call(this)

  var SELF = this
}

var Mam = require('../lib/mam.node.js')
var IOTA = require('iota.lib.js')
var iota = new IOTA({ provider: `http://p103.iotaledger.net:14700/` })

// Init State
let root = ''

// Initialise MAM State
var mamState = Mam.init(iota)

// Publish to tangle
const publish = async packet => {
  // Get MAM payload
  var message = Mam.create(mamState, packet)
  // Save new mamState
  mamState = message.state
  // Attach the payload.
  console.log('Root: ', message.root)
  await Mam.attach(message.payload, message.root)
}

publish('POTATO')

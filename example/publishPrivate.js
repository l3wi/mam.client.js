var Mam = require('../lib/mam.node.js')
var IOTA = require('iota.lib.js')
var iota = new IOTA({ provider: `https://testnet140.tangle.works` })

// Initialise MAM State
var mamState = Mam.init(iota)

// Set channel mode
mamState = Mam.changeMode(mamState, 'private')

// Publish to tangle
const publish = async packet => {
    // Create MAM Payload - STRING OF TRYTES
    var message = Mam.create(mamState, packet)
    // Save new mamState
    mamState = message.state
    console.log('Root: ', message.root)
    console.log('Address: ', message.address)
    // Attach the payload.
    await Mam.attach(message.payload, message.address)

    // Fetch Stream Async to Test
    var resp = await Mam.fetch(message.root, 'private', null, console.log)
    console.log(resp)
}

publish('POTATO')

const Mam = require('../lib/mam.client.js')
const IOTA = require('iota.lib.js')
const iota = new IOTA({ provider: `https://testnet140.tangle.works` })

// Initialise MAM State - PUBLIC
let mamState = Mam.init(iota)

// Publish to tangle
const publish = async packet => {
    // Create MAM Payload - STRING OF TRYTES
    const message = Mam.create(mamState, packet)
    // Save new mamState
    mamState = message.state
    // Attach the payload.
    console.log('Root: ', message.root)
    console.log('Address: ', message.address)
    await Mam.attach(message.payload, message.address)

    // Fetch Stream Async to Test
    const resp = await Mam.fetch(message.root, 'public', null, console.log)
    console.log(resp)
}

publish('POTATO')

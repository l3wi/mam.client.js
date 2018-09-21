const Mam = require('../lib/mam.client.js')
const { asciiToTrytes, trytesToAscii } = require('@iota/converter')

// Init State
let root = ''

// Initialise MAM State
let mamState = Mam.init('https://testnet140.tangle.works')

// Publish to tangle
const publish = async packet => {
    const trytes = asciiToTrytes(JSON.stringify(packet))
    const message = Mam.create(mamState, trytes)
    mamState = message.state
    await Mam.attach(message.payload, message.address)
    return message.root
}

// Callback used to pass data out of the fetch
const logData = data => console.log(JSON.parse(trytesToAscii(data)))

const execute = async () => {
    // Publish and save root.
    root = await publish('POTATO ONE')
    // Publish but not save root
    await publish('POTATO TWO')
    await publish('POTATO THREE')

    // Callback used to pass data + returns next_root
    const resp = await Mam.fetch(root, 'public', null, logData)

    console.log(resp, root)
}

execute()

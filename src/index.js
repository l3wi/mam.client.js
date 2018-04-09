/// Deps
require('babel-polyfill')
const crypto = require('crypto')
const Crypto = require('iota.crypto.js')
const Encryption = require('./encryption')
const pify = require('pify')

// Setup Provider
let iota = {}
let Mam = {}

/**
 * Initialisation function which returns a state object
 * @param  {object} externalIOTA
 * @param  {string} seed
 * @param  {integer} security
 */
const init = (externalIOTA = {}, seed = keyGen(81), security = 2) => {
    // Set IOTA object
    iota = externalIOTA

    // Setup Personal Channel
    const channel = {
        side_key: null,
        mode: 'public',
        next_root: null,
        security,
        start: 0,
        count: 1,
        next_count: 1,
        index: 0
    }

    return {
        subscribed: [],
        channel,
        seed
    }
}
/**
 * Add a subscription to your state object
 * @param  {object} state
 * @param  {string} channelRoot
 * @param  {string} channelKey
 */
const subscribe = (state, channelRoot, channelKey = null) => {
    state.subscribed[channelRoot] = {
        channelKey,
        timeout: 5000,
        root: channelRoot,
        next_root: null,
        active: true
    }
    return state
}

const changeMode = (state, mode, sidekey) => {
    if (mode !== 'public' && mode !== 'private' && mode !== 'restricted') {
        return console.log('Did not recognise mode!')
    }
    if (mode === 'restricted' && !sidekey) {
        return console.log(
            'You must specify a side key for a restricted channel'
        )
    }
    if (sidekey) {
      state.channel.side_key = sidekey
    }
    state.channel.mode = mode
    return state
}

/**
 * create
 * @param  {object} state
 * @param  {sting} message // Tryte encoded string
 */
const create = (state, message) => {
    const channel = state.channel
    // Interact with MAM Lib
    const mam = Mam.createMessage(state.seed, message, channel.side_key, channel)

    // If the tree is exhausted.
    if (channel.index === channel.count - 1) {
        // change start to begining of next tree.
        channel.start = channel.next_count + channel.start
        // Reset index.
        channel.index = 0
    } else {
        // Else step the tree.
        channel.index++
    }

    // Advance Channel
    channel.next_root = mam.next_root
    state.channel = channel

    // Generate attachement address
    let address
    if (channel.mode !== 'public') {
        address = Crypto.converter.trytes(
            Encryption.hash(81, Crypto.converter.trits(mam.root.slice()))
        )
    } else {
        address = mam.root
    }

    return {
        state,
        payload: mam.payload,
        root: mam.root,
        address
    }
}

// Current root
const getRoot = state => Mam.getMamRoot(state.seed, state.channel)

const decode = (payload, side_key, root) => {
    const mam = Mam.decodeMessage(payload, side_key, root)
    return mam
}

const fetch = async (root, mode, sidekey, callback, rounds = 81) => {
    const messages = []
    let consumedAll = false
    let nextRoot = root
    let transactionCount = 0
    let messageCount = 0

    while (!consumedAll) {
        // Apply channel mode
        let address = nextRoot
        if (mode === 'private' || mode === 'restricted') {
            address = hash(nextRoot, rounds)
        }

        // Fetching
        const hashes = await pify(iota.api.findTransactions.bind(iota.api)) ({
            addresses: [address]
        })

        if (hashes.length == 0) {
            consumedAll = true
            break
        }

        transactionCount += hashes.length
        messageCount++

        const messagesGen = await txHashesToMessages(hashes)
        for (let message of messagesGen) {
            try {
                // Unmask the message
                const { payload, next_root } = decode(message, sidekey, nextRoot)
                // Push payload into the messages array
                if (!callback) {
                    messages.push(payload)
                } else {
                    callback(payload)
                }
                nextRoot = next_root
            } catch (e) {
                return console.error('failed to parse: ', e)
            }
        }
    }

    const resp = {}
    resp.nextRoot = nextRoot
    if (!callback) {
      resp.messages = messages
    }
    return resp
}

const fetchSingle = async (root, mode, sidekey, rounds = 81) => {
    let address = root
    if (mode === 'private' || mode === 'restricted') {
        address = hash(root, rounds)
    }
    const hashes = await pify(iota.api.findTransactions.bind(iota.api)) ({
        addresses: [address]
    })

    const messagesGen = await txHashesToMessages(hashes)
    for (let message of messagesGen) {
        try {
            // Unmask the message
            const { payload, next_root } = decode(message, sidekey, root)
            // Return payload
            return { payload, nextRoot: next_root }
        } catch (e) {
            console.error('failed to parse: ', e)
        }
    }
}

const listen = (channel, callback) => {
    let root = channel.root
    return setTimeout(async () => {
        let resp = await fetch(root)
        root = resp.nextRoot
        callback(resp.messages)
    }, channel.timeout)
}

// Parse bundles and
const txHashesToMessages = async hashes => {
    const bundles = {}

    const processTx = txo => {
        const bundle = txo.bundle
        const msg = txo.signatureMessageFragment
        const idx = txo.currentIndex
        const maxIdx = txo.lastIndex

        if (bundle in bundles) {
            bundles[bundle].push([idx, msg])
        } else {
            bundles[bundle] = [[idx, msg]]
        }

        if (bundles[bundle].length == maxIdx + 1) {
            let l = bundles[bundle]
            delete bundles[bundle]
            return l
                .sort((a, b) => b[0] < a[0])
                .reduce((acc, n) => acc + n[1], '')
        }
    }

    const objs = await pify(iota.api.getTransactionsObjects.bind(iota.api)) (
        hashes
    )
    return objs
        .map(result => processTx(result))
        .filter(item => item !== undefined)
}

const attach = async (trytes, root, depth = 6, mwm = 14) => {
    const transfers = [
        {
            address: root,
            value: 0,
            message: trytes
        }
    ]
    // if (isClient) curl.overrideAttachToTangle(iota)
    try {
        const objs = await pify(iota.api.sendTransfer.bind(iota.api)) (
            keyGen(81),
            depth,
            mwm,
            transfers
        )
        return objs
    } catch (e) {
        console.error('failed to attach message:', '\n', e)
        return e
    }
}

// Helpers
const hash = (data, rounds) => {
    return Crypto.converter.trytes(
        Encryption.hash(
            rounds || 81,
            Crypto.converter.trits(data.slice())
        ).slice()
    )
}

const isClient =
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement

const keyGen = length => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9'
    const values = crypto.randomBytes(length)
    return Array.from(
      new Array(length), (x, i) => charset[values[i] % charset.length]
    ).join('')
}

const setupEnv = rustBindings => (Mam = rustBindings)

const setIOTA = (externalIOTA = {}) => (iota = externalIOTA)

module.exports = {
    init,
    subscribe,
    changeMode,
    create,
    decode,
    fetch,
    fetchSingle,
    attach,
    listen,
    getRoot,
    setIOTA,
    setupEnv
}

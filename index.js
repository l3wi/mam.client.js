/// Deps
const crypto = require("crypto")
const Crypto = require("iota.crypto.js")
const Encryption = require("./libs/encryption")
const IOTA = require("iota.lib.js")
/// MAM Interface
var MAM = require("./mam")
//
let iota = new IOTA({ provider: `http://p101.iotaledger.net:14700/` })

const keyGen = length => {
  var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9"
  var values = crypto.randomBytes(length)
  var result = new Array(length)
  for (var i = 0; i < length; i++) {
    result[i] = charset[values[i] % charset.length]
  }
  return result.join("")
}

const init = (seed = keyGen(81), security = 2) => {
  // Setup Personal Channel
  var channelSeed = Encryption.hash(Crypto.converter.trits(seed.slice()))
  var channelKey = Crypto.converter.trytes(channelSeed.slice())
  var channel = {
    side_key: channelKey,
    security: security,
    start: 0,
    count: 2,
    next_count: 1,
    index: 0
  }
  // Setup Subs
  const subscribed = []
  return {
    subscribed: subscribed,
    channel: channel,
    seed: seed
  }
}

const create = (state, message = "HALLOTHAR") => {
  let mam = MAM.createMessage(
    state.seed,
    message,
    state.channel.side_key,
    state.channel
  )
  state.channel.index++
  return { state, payload: mam.payload, root: mam.root, side_key: mam.side_key }
}

const subscribe = (state, channelKey) => {
  state.subscribed[channelKey] = {
    channelKey: channelKey,
    timeout: 1000,
    root: null,
    next_root: null,
    next_key: null,
    active: true
  }
  return state
}

const fetch = channel => {
  // Loop of fetching data til next root can not be read/found
  // iota.api.getTransactions( () => {})
}

const decode = (payload, side_key, root) => {
  let mam = MAM.decodeMessage(payload, side_key, root)
  return mam
}

const sendTrytes = trytes => {
  return new Promise(resolve => {
    // if (isClient) curl.overrideAttachToTangle(iota)
    iota.api.sendTrytes(trytes, 5, 9, (err, tx) => {
      if (err) console.log("Error:", err)
      else console.log("Published!")
      resolve(tx)
    })
  })
}

const isClient =
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement

let state = init()
var message1 = create(state)
state = message1.state
console.log(message1)
console.log(iota.valid.isTrytes(message1.payload))
var decodedMessage = decode(message1.payload, message1.side_key, message1.root)
console.log(decodedMessage)

sendTrytes(message1.payload)

// var message2 = create(state)
// state = message2.state
// console.log(message2)

// var message3 = create(state)
// state = message3.state
// console.log(message3)

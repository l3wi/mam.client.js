/// Deps
const crypto = require("crypto")
const Crypto = require("iota.crypto.js")
const Encryption = require("./encryption")
const IOTA = require("iota.lib.js")
const pify = require("pify")

/// MAM Interface
var MAM = require("./mam")
// Setup Provider
let iota = new IOTA({ provider: `http://p101.iotaledger.net:14700` })

const init = (seed = keyGen(81), security = 2) => {
  // Setup Personal Channel
  var channelSeed = Encryption.hash(Crypto.converter.trits(seed.slice()))
  var channelKey = Crypto.converter.trytes(channelSeed.slice())
  var channel = {
    side_key: null,
    next_root: null,
    security: security,
    start: 0,
    count: 1,
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

const subscribe = (state, channelRoot, channelKey = null) => {
  state.subscribed[channelRoot] = {
    channelKey: channelKey,
    timeout: 5000,
    root: channelRoot,
    next_root: null,
    active: true
  }
  return state
}

const create = (state, message) => {
  var channel = state.channel
  let mam = MAM.createMessage(state.seed, message, null, channel)
  // If the tree is exhausted.
  if (channel.index == channel.count - 1) {
    // change start to begining of next tree.
    channel.start = channel.next_count
    // Reset index.
    channel.index = 0
  } else {
    //Else step the tree.
    channel.index++
  }
  channel.next_root = mam.next_root
  state.channel = channel
  return {
    state,
    payload: mam.payload,
    root: mam.root
  }
}

const decode = (payload, side_key, root) => {
  let mam = MAM.decodeMessage(payload, side_key, root)
  return mam
}

const fetch = async address => {
  let consumedAll = false
  let messages = []
  let nextRoot = address

  let transactionCount = 0
  let messageCount = 0

  while (!consumedAll) {
    console.log("Looking up data at: ", nextRoot)
    let hashes = await pify(iota.api.findTransactions.bind(iota.api))({
      addresses: [nextRoot]
    })

    if (hashes.length == 0) {
      consumedAll = true
      break
    }

    transactionCount += hashes.length
    messageCount++

    let messagesGen = await txHashesToMessages(hashes)
    for (let message of messagesGen) {
      try {
        var payload = message
        let unmasked = decode(payload, null, nextRoot)
        messages.push(unmasked.payload)
        nextRoot = unmasked.next_root
      } catch (e) {
        console.error("failed to parse: ", e)
      }
    }
  }

  console.log("Total transaction count: ", transactionCount)

  return {
    nextRoot: nextRoot,
    messages: messages
  }
}

const listen = (channel, callback) => {
  var root = channel.root
  return setTimeout(async () => {
    console.log("Fetching")
    var resp = await fetch(root)
    root = resp.nextRoot
    callback(resp.messages)
  }, channel.timeout)
}

// Sync requests
const txHashesToMessages = async hashes => {
  let bundles = {}

  let processTx = txo => {
    let bundle = txo.bundle
    let msg = txo.signatureMessageFragment
    let idx = txo.currentIndex
    let maxIdx = txo.lastIndex

    if (bundle in bundles) {
      bundles[bundle].push([idx, msg])
    } else {
      bundles[bundle] = [[idx, msg]]
    }

    if (bundles[bundle].length == maxIdx + 1) {
      let l = bundles[bundle]
      delete bundles[bundle]
      return l.sort((a, b) => b[0] < a[0]).reduce((acc, n) => acc + n[1], "")
    }
  }

  let objs = await pify(iota.api.getTransactionsObjects.bind(iota.api))(hashes)
  return objs
    .map(result => processTx(result))
    .filter(item => item !== undefined)
}

const attach = async (trytes, root) => {
  var transfers = [
    {
      address: root,
      value: 0,
      message: trytes
    }
  ]
  // if (isClient) curl.overrideAttachToTangle(iota)
  try {
    let objs = await pify(iota.api.sendTransfer.bind(iota.api))(
      keyGen(81),
      5,
      9,
      transfers
    )
    console.log("Message attached")
    return objs
  } catch (e) {
    return console.error("failed to attach message:", "\n", e)
  }
}

const isClient =
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement

const keyGen = length => {
  var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9"
  var values = crypto.randomBytes(length)
  var result = new Array(length)
  for (var i = 0; i < length; i++) {
    result[i] = charset[values[i] % charset.length]
  }
  return result.join("")
}

module.exports = {
  init: init,
  subscribe: subscribe,
  create: create,
  decode: decode,
  fetch: fetch,
  attach: attach,
  listen: listen
}

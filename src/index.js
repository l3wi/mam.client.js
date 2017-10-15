/// Deps
const crypto = require("crypto")
const Crypto = require("iota.crypto.js")
const Encryption = require("./encryption")
const IOTA = require("iota.lib.js")
const pify = require("pify")

/// MAM Interface
var MAM = require("./mam")
//
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

const subscribe = (state, channelRoot, channelKey = null) => {
  state.subscribed[channelRoot] = {
    channelKey: channelKey,
    timeout: 1000,
    root: null,
    next_root: null,
    next_key: null,
    active: true
  }
  return state
}

const create = (state, message = "HALLOTHAR") => {
  let mam = MAM.createMessage(state.seed, message, null, state.channel)
  state.channel.index++
  state.channel.next_root = mam.next_root
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
        var payload = message.split("EEEE")[0]
        console.log(payload.length)
        console.log(message.length)
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
      message: trytes + `EEEE`
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

///////////////////
const test = async () => {
  let state = init()
  console.log("Creating MAM payload")
  var message1 = create(state, `POTATO`)
  state = message1.state
  console.log("Index: ", state.channel.index)
  console.log("Root: ", message1.root)

  await attach(message1.payload, message1.root)

  console.log("Creating MAM payload")
  var message2 = create(state, `POTATO`)
  state = message2.state
  console.log("Index: ", state.channel.index)
  console.log("Root: ", message2.root)

  await attach(message2.payload, message2.root)

  var data = await fetch(message1.root)

  console.log(data.messages)
}

test()
// var message2 = create(state)
// state = message2.state
// console.log(message2)

// var message3 = create(state)
// state = message3.state
// console.log(message3)

var MAM = require("../src/mam")

// MAM settings
const SEED =
  "DSFAGKJHASDFVBLKDFSJVJLKERWJGVOIERHBOISDFJBVIOUJSHDVOSDFIUHSDOFHSDIUFHSDUIFHSIUDF"
const MESSAGE = "NOWIAMBECOMEDEATH9DESTROYEROFWORLDS"

const SIDE_KEY =
  "999999999999999999999999999999999999999999999999999999999999999999999999999999999"

let CHANNEL = {
  security: 2,
  start: 0,
  count: 1,
  next_count: 1,
  index: 0
}

let message = MAM.createMessage(SEED, MESSAGE, SIDE_KEY, CHANNEL)
let decoded = MAM.decodeMessage(message.payload, null, message.root)
console.log(message.root)
console.log(decoded)

let CHANNEL2 = {
  security: 2,
  start: 1,
  count: 1,
  next_count: 1,
  index: 0
}

let message2 = MAM.createMessage(SEED, MESSAGE, SIDE_KEY, CHANNEL2)
let decoded2 = MAM.decodeMessage(message2.payload, null, message2.root)
console.log(message2.root)
console.log(decoded2)

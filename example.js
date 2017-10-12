var MAM = require("./mam")

// MAM settings
const SEED =
  "DSFAGKJHASDFVBLKDFSJVJLKERWJGVOIERHBOISDFJBVIOUJSHDVOSDFIUHSDOFHSDIUFHSDUIFHSIUDF"
const MESSAGE = "NOWIAMBECOMEDEATH9DESTROYEROFWORLDS"

const SIDE_KEY =
  "999999999999999999999999999999999999999999999999999999999999999999999999999999999"

let CHANNEL = {
  security: 2,
  start: 0,
  count: 2,
  next_count: 1,
  index: 0
}

let message = MAM.createMessage(SEED, MESSAGE, SIDE_KEY, CHANNEL)
let decoded = MAM.decodeMessage(message.payload, null, message.root)
console.log(message)

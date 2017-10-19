var Mam = require("../src/index.js")

const example = async () => {
  // Init State
  let state = Mam.init()
  // Create Message one
  console.log("Creating MAM payload")
  var message1 = Mam.create(state, `POTATO`)
  state = message1.state
  console.log("Root: ", message1.root)
  // Attach that message
  await Mam.attach(message1.payload, message1.root)

  // Create Message Two
  console.log("Creating MAM payload")
  var message2 = Mam.create(state, `MASHEPOTATOE`)
  state = message2.state
  console.log("Root: ", message2.root)
  // Attach that message
  await Mam.attach(message2.payload, message2.root)

  // Fetch data starting from root one!
  var data = await Mam.fetch(message1.root)

  // Show messages
  console.log(data.messages)
}

example()

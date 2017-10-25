# MAM Client JS Library

This is wrapper library for the WASM/ASM.js output of the [MAM Rust repository](https://github.com/iotaledger/MAM). This will enable you to interact and create MAM streams without any further software.

> **Join the Discussion**
>
> If you want to get involved in the community, need help with getting setup, have any issues related with the library or just want to discuss Blockchain, Distributed Ledgers and IoT with other people, feel free to join our Slack. [Slack](http://slack.iota.org/) You can also ask questions on our dedicated forum at: [IOTA Forum](https://forum.iota.org/).

## Getting Started

After downloading the appropriate file for your project, `mam.node.js` or `mam.web.js`, importing the library will provide access to the functions described below. 

For a simple user experience you are advised to call the `init()` function to enable to tracking of state in your channels.When calling `init()` you should also pass in your initialised IOTA library.  This will provide access to some extra functionality including attaching, fetching and subscribing.


## Basic Usage

------

### `init`

This takes initialises the state and binds the `iota.lib.js` to the library. This will return a state object that tracks the progress of your stream and streams you are following

#### Input

```
Mam.init(iota, seed, security)
```

1. **iota**: `Object` Initialised IOTA library with a provider set.
2. **seed**: `String` Tryte-encoded seed. *Null value generates a random seed*
3. **security**: `Integer` Security of the keys used. *Null value default to `2`*

#### Return Value

1. **Object** - Initialised state object to be used in future actions

------

### `create`

Creates a MAM message payload from a state object, tryte-encoded message and an optional side key. Returns an updated state and the payload for sending. 

#### Input

```
Mam.create(state, message, sideKey)
```

1. **state**: `Object` Initialised IOTA library with a provider set.
2. **message**: `String` Tryte-encoded payload to be encrypted.
3. **sideKey**: `Integer` Security of the keys used. *Null value falls back to default key`*

#### Return Value

1. **state**: `Object` Updated state object to be used with future actions/
2. **payload**: `String` Tryte-encoded payload.
3. **root**: `String` Tryte-encoded root used as an address to attach the payload..

------

### `decode`

Enables a user to decode a 

#### Input

```
Mam.decode(payload, sideKey, root)
```

1. **state**: `Object` Initialised IOTA library with a provider set.
2. **message**: `String` Tryte-encoded payload to be encrypted.
3. **sideKey**: `Integer` Security of the keys used. *Null value falls back to default key`*

#### Return Value

1. **state**: `Object` Updated state object to be used with future actions/
2. **payload**: `String` Tryte-encoded payload.
3. **root**: `String` Tryte-encoded root used as an address to attach the payload..



## Building the library

Compiled binaries are included in the repository. Compiling the Rust bindings can require some complex environmental setup to get to work, so if you are unfamiliar just stick to the compiled files. 

This repo provides wrappers for both Browser and Node environments. The build script discriminates between a WASM.js and ASM.js build methods and returns files that are includable in your project.

### Browser

The below command will build two files: `iota-bindings-emscripten.wasm` & `mam.web.js`. These need to be included in the browser (**in the above order**). 

Additionally, due to quirks in the `rust-wasm-loader` you will need to adjust the `webpack.config.js` file and change the `output` variable to match how your project will serve the file to the browser. Once loaded it will bind to the window as `Mam`.

```javascript
// Install dependencies
yarn
// Install submodules
git submodule update --init --recursive
// Build for web
yarn web -- --env.path=/serving/path/here/     
```

### Node.js

The below command will build a file called `mam.node.js` in the `lib/` directory.

```javascript
// Install dependencies
yarn
// Install submodules
git submodule update --init --recursive
// Build for node
yarn node
```
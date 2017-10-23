# MAM Client JS Library

This is wrapper library for the WASM/ASM.js output of the [MAM Rust repository](https://github.com/iotaledger/MAM). This will enable you to interact and create MAM streams without any further software.

> **Join the Discussion**
>
> If you want to get involved in the community, need help with getting setup, have any issues related with the library or just want to discuss Blockchain, Distributed Ledgers and IoT with other people, feel free to join our Slack. [Slack](http://slack.iota.org/) You can also ask questions on our dedicated forum at: [IOTA Forum](https://forum.iota.org/).

## Usage

This library's core functions are built in Rust. This repo provides wrappers for both Browser and Node environments. The build script discriminates between a WASM.js and ASM.js build methods and returns files that are includable in your project..

### Browser

The below command will build two files: `iota-bindings-emscripten.wasm` & `mam.web.js`. These need to be included in the browser (**in the above order**). 

Additionally, due to quirks in the `rust-wasm-loader` you will need to adjust the `webpack.config.js` file and change the `output` variable to match how your project will serve the file to the browser. Once loaded it will bind to the window as `Mam`.

```javascript
// Install dependencies
yarn
// Install submodules
git submodule update --init --recursive
// Build for web
yarn web -- --env.path=serving/path/here/     
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

## Concepts

#### Security Levels

Public - Root is equal to address and the side key is ‘999999…’

Private - WIP

Restricted - WIP




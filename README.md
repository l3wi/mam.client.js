# MAM Client JS Library

This is wrapper library for the WASM/ASM.js output of the [MAM rust repository](https://github.com/iotaledger/MAM). This will enable you to interact and create MAM streams without any further software.

> **Join the Discussion**
>
> If you want to get involved in the community, need help with getting setup, have any issues related with the library or just want to discuss Blockchain, Distributed Ledgers and IoT with other people, feel free to join our Slack. [Slack](http://slack.iota.org/) You can also ask questions on our dedicated forum at: [IOTA Forum](https://forum.iota.org/).

## Installation

### Node.js

```
npm install iotaledger/mam.client.js
```

## Concepts

Flash Channels use a binary tree topology reduce the number of transactions to be attached. Usually each transfer would have to be attached to the tangle, Flash enables realtime streaming of tokens off-tangle.

#### Security Levels

Public 

- Root is equal to address and the side key is ‘999999…’

Private 

- Root is hashed address and the side key is ‘999999…’

Restricted

 - Root is hashed address and a custom side key ‘AJDKHGKAGD…’ (changing or not)

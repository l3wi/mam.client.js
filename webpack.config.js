/* global __dirname, require, module*/

const webpack = require('webpack')
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
const path = require('path')
const env = require('yargs').argv.env // use --env with webpack 2

var output = 'lib/'
var libraryName = 'mam.'
var entry
var target
var outputFile
var rules = [
    {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: [/(node_modules|bower_components)/]
    }
]

entry = __dirname + '/src/node.js'
outputFile = libraryName + 'client.js'
target = 'node'

const config = {
    entry: entry,
    output: {
        path: __dirname + '/' + output,
        filename: outputFile,
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: rules
    },
    resolve: {
        modules: [path.resolve('./node_modules'), path.resolve('./src')],
        extensions: ['.json', '.js']
    },
    target: target,
    node: {
        fs: 'empty',
        child_process: 'empty',
        path: 'empty'
    }
}
console.log(config.output)
module.exports = config

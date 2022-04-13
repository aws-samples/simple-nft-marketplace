const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      fallback: {
        os: require.resolve("os-browserify/browser"),
        https: require.resolve("https-browserify"),
        http: require.resolve("stream-http"),
        crypto: require.resolve("crypto-browserify"),
        assert: require.resolve("assert/"),
        stream: require.resolve("stream-browserify"),
      },
      alias: {
        web3: path.join(__dirname, './node_modules/web3/dist/web3.min.js')
      }
    }
  }
};
const webpack = require('webpack');
const path = require('path');

module.exports = {
  webpack: {
    configure: (config) => {
      // Add polyfill mappings
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "path": require.resolve("path-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/"),
        "vm": require.resolve("vm-browserify"),
        "console": require.resolve("console-browserify"),
        "fs": false,
        "process": require.resolve("process/browser.js")
      };

      // Add plugin configuration
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser.js",
        })
      );

      // Handle node: protocol
      config.plugins.push(new webpack.NormalModuleReplacementPlugin(
        /^node:/,
        (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
        }
      ));

      // Exclude signalapp from source maps
      config.module.rules.push({
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
        exclude: [
          path.resolve(__dirname, "node_modules/@signalapp/libsignal-client")
        ]
      });

      return config;
    }
  }
};
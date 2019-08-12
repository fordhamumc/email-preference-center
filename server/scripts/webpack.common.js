const path = require("path");

module.exports = {
  entry: "../src/server.js",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "server.js"
  },
  target: "node",
  module: {
    rules: [
      {
        exclude: [path.resolve(__dirname, "node_modules")],
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader"
          }
        ]
      },
      {
        exclude: [path.resolve(__dirname, "node_modules")],
        test: /\.(graphql|gql)$/,
        loader: "graphql-tag/loader"
      }
    ]
  },
  devServer: {
    port: 4000
  }
};

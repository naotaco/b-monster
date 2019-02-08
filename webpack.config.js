const path = require("path");

module.exports = {
  target: "node",
  entry: "./src/index.ts",
  cache: true,
  mode: "development",
  devtool: "source-map",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "index.js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader"
      },
      {
        test: /\.tsx?$/,
        enforce: "pre",
        loader: "tslint-loader",
        options: {
          configFile: "./tslint.json",
          typeCheck: true
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "~": path.resolve(__dirname, "src/")
    }
  }
};

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: '/',
    chunkFilename: '[name].[contenthash].js'
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      parallel: false,
    })],
    splitChunks: {
      chunks: 'all',
    },
  },
  cache: {
    type: 'filesystem',
  },
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
  module: {
    rules: [
      {
        test: /\.js$|jsx/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            cacheDirectory: true,
          }
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src/workers'),
        use: { loader: 'worker-loader' },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
      filename: './index.html',
      favicon: './public/favicon.ico'
    }),
    new MonacoWebpackPlugin({
      languages: ['javascript', 'json']
    })
  ],
  mode: "production",
};

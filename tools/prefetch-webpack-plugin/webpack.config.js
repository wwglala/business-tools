const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { PrefetchWebpackPlugin } = require('./dist/cjs/index');

/** @type { import('webpack').Configuration } */
module.exports = {
  entry: './main/index.ts',
  output: {
    filename: '[name]-[hash:8].js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
    publicPath: '//www.aa.cc',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './main/index.html',
    }),
    new PrefetchWebpackPlugin({
      entryName: 'prefetch',
      entryPath: './main/prefetch.ts',
    }),
  ],
};

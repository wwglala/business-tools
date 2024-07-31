const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { PrefetchWebpackPlugin } = require('@waou/prefetch-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

/** @type { import('webpack').Configuration } */
module.exports = () => {
  return {
    entry: {
      main: path.resolve(__dirname, './src/index.tsx'),
      prefetch: path.resolve(__dirname, './src/prefetch.ts'),
    },
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: '[name]-[hash:8].js',
      clean: true,
    },
    mode: isProd ? 'production' : 'development',
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
    },
    // devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.s[ac]ss$/i,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(js|tsx?)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-react',
                  {
                    runtime: 'automatic',
                  },
                ],
                '@babel/preset-typescript',
              ],
              plugins: [
                !isProd && require.resolve('react-refresh/babel'),
              ].filter(Boolean),
            },
          },
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './config/index.html'),
      }),
      new ReactRefreshPlugin(),
      new PrefetchWebpackPlugin({
        entryName: 'prefetch',
        entryPath: './src/prefetch.ts',
      }),
    ],
    devServer: {
      historyApiFallback: true,
    },
  };
};

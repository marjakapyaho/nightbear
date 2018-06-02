const webpack = require('webpack'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  ExtractTextPlugin = require('extract-text-webpack-plugin'),
  WebpackCleanupPlugin = require('webpack-cleanup-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  SourceMapDevToolPlugin = webpack.SourceMapDevToolPlugin;

const IS_PROD = process.argv.indexOf('-p') >= 0;

module.exports = {
  context: `${__dirname}/app`,
  entry: ['./index.tsx', './index.scss'],
  output: {
    path: `${__dirname}/dist`,
    filename: 'index.js',
  },
  devtool: IS_PROD ? false : 'eval-source-map',
  target: 'web',
  resolve: {
    extensions: ['.js', '.tsx'],
    alias: {
      app: `${__dirname}/app`, // allow non-relative imports from "app/..."
    },
  },
  node: {
    __filename: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx$/,
        use: 'ts-loader',
      },
      {
        test: /\.scss$/,
        use: ['css-hot-loader'].concat(
          ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  url: false, // don't attempt to resolve url()'s in SCSS
                  sourceMap: true,
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                  includePaths: ['node_modules'],
                },
              },
            ],
          }),
        ),
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: IS_PROD ? 'production' : 'development',
    }),
    new CopyWebpackPlugin(['assets/**']),
    new WebpackCleanupPlugin(),
    new ExtractTextPlugin({
      filename: 'index.css',
      disable: !IS_PROD,
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new ExtractTextPlugin({
      filename: 'index.css',
      allChunks: true,
      disable: !IS_PROD,
    }),
    new SourceMapDevToolPlugin({
      include: IS_PROD ? [] : ['index.js', 'index.css'],
      filename: '[file].map',
    }),
  ],
  devServer: {
    contentBase: `${__dirname}/app`,
    hot: true,
    stats: 'minimal',
    overlay: true,
  },
};

// For inspiration on your webpack configuration, see:
// https://github.com/shakacode/react_on_rails/tree/master/spec/dummy/client
// https://github.com/shakacode/react-webpack-rails-tutorial/tree/master/client

const webpack = require('webpack');
const { resolve } = require('path');
const path = require('path');
const Autoprefixer = require('autoprefixer');
const CustomProperties = require('postcss-custom-properties');
const ManifestPlugin = require('webpack-manifest-plugin');
const webpackConfigLoader = require('react-on-rails/webpackConfigLoader');

const configPath = resolve('..', 'config');
const { output, settings } = webpackConfigLoader(configPath);
const imagesFileLoaderOptions = { name: 'images/[hash].[ext]' };
const prodBuild = process.env.RAILS_ENV === 'production';
const CompressionPlugin = require('compression-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

// TODO: fix hmr to be used for development
const isHMR = settings.server.hmr; // eslint-disable-line no-unused-vars
// let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = {

  context: resolve(__dirname),

  entry: {
    'webpack-bundle': [
      'es5-shim/es5-shim',
      'es5-shim/es5-sham',
      'babel-polyfill',
      './app/index.jsx',
    ],
  },

  output: {
    // Name comes from the entry section.
    filename: '[name]-[hash].js',
    chunkFilename: '[name]-[chunkhash].chunk.js',

    // Leading slash is necessary
    publicPath: output.publicPath,
    path: output.path,
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [path.resolve(__dirname, 'aggregated-translations'), 'node_modules'],
  },

  mode: 'production',

  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          ecma: 6,
          output: {
            comments: false,
          },
          compress: {
            dead_code: true,
            drop_console: true,
          },
        },
        sourceMap: false,
      }),
    ],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: prodBuild ? 'production' : 'development',
      DEBUG: false,
    }),
    new ManifestPlugin({ publicPath: output.publicPath, writeToFileEmit: true }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(), // Merge chunks
    new CompressionPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$|\.eot?.+$|\.ttf?.+$|\.woff?.+$|\.svg?.+$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new webpack.HotModuleReplacementPlugin(),
    // new BundleAnalyzerPlugin(), // To be used for development only
  ],

  module: {
    rules: [
      {
        test: require.resolve('react'),
        use: {
          loader: 'imports-loader',
          options: {
            shim: 'es5-shim/es5-shim',
            sham: 'es5-shim/es5-sham',
          },
        },
      },
      {
        test: /\.(scss|css|less)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 2,
              localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins() {
                return [
                  Autoprefixer({
                    browsers: [
                      'ie >= 10',
                      'last 2 versions',
                      'last 2 android versions',
                      'last 2 and_chr versions',
                      'iOS >= 8',
                    ],
                  }),
                  CustomProperties(),
                ];
              },
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: 'file-loader',
        options: imagesFileLoaderOptions,
      },
      {
        test: /\.(woff|woff2)$/,
        use: {
          loader: 'url-loader',
        },
      },
      {
        test: /\.(ttf|eot|svg)$/,
        use: {
          loader: 'file-loader',
        },
      },
      {
        test: require.resolve('jquery-visible/jquery.visible.js'),
        use: 'imports-loader?$=jquery',
      },
    ],
  },
};

module.exports = config;

if (prodBuild) {
  console.log('Webpack production build for Rails'); // eslint-disable-line no-console
  imagesFileLoaderOptions.publicPath = '/webpack/production/';
} else {
  console.log('Webpack dev build for Rails'); // eslint-disable-line no-console
  imagesFileLoaderOptions.publicPath = '/webpack/development/';
  module.exports.devtool = 'eval-source-map';
}

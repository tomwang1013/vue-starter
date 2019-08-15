const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const utils = require('./utils');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const nowStr = new Date().toLocaleString().replace(/(-\d{1,2})|[ :]/g, i => {
  if (i.length === 1) return '';
  if (i.length === 2) return '0' + i[1];
  return i.slice(1);
});

const htmlTemplates =
  ['index'].map(tpl => {
    return new HtmlWebpackPlugin({
      template: path.resolve(utils.sourceCtx, `${ tpl }.html`),
      chunks: ['runtime', 'vendor', tpl],
      minify: false,
      filename: `${ tpl }.html`,
      _t: nowStr
    })
  });

const extractScss = new MiniCssExtractPlugin({
  filename: process.env.NODE_ENV === 'production' ?
    'css/[name].css?[contenthash:7]-' + nowStr :
    'css/[name].css',
});

const scssExtractLoader = [
  process.env.NODE_ENV === 'development' ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
  'css-loader',
  'resolve-url-loader',
  {
    loader: 'sass-loader',
    options: {
      sourceMap: true,
      sourceMapContents: false
    }
  }
];

module.exports = {
  name: 'Application',
  context: utils.projectCtx,
  output: {
    path: utils.releaseCtx,
    publicPath: './',

    // https://github.com/webpack/webpack/issues/6604
    // runtimeChunk会使得filename被chunkFileName覆盖
    filename: process.env.NODE_ENV === 'production' ?
      ('js/[name].js?[chunkhash:7]-' + nowStr) :
      'js/[name].js'
    // chunkFilename: '[name].bundle.js'
  },

  entry: {
    'index': './src/index.js'
  },

  resolve: {
    symlinks: false,
    modules: [utils.sourceCtx, 'node_modules'],
    extensions: ['.js', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.runtime.esm.js'
    }
  },

  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: scssExtractLoader
      },

      {
        test: /\.vue$/,
        use: 'vue-loader'
      },

      {
        test: /\.m?js$/,
        use: 'babel-loader',
        exclude: file => /node_modules/.test(file) && !/\.vue\.js/.test(file)
      },

      {
        test: utils.normalizeExpr('/icon/.*(png|jpg|gif|jpeg)$'),
        use: {
          loader: 'file-loader',
          options: {
            context: utils.resolve('src/assets'),
            publicPath: '../',
            useRelativePath: true,
            name: (url) => {
              url = utils.normalizeUrl(url.replace(utils.projectCtx, ''));
              url = url.replace('/src/assets/icon', 'img');
              return `${ url }?[hash:7]`;
            }
          }
        }
      },

      {
        test: utils.normalizeExpr('/img/.*(png|jpg|gif|jpeg)$'),
        use: {
          loader: 'file-loader',
          options: {
            context: utils.resolve('src/assets'),
            useRelativePath: true,
            name: '[path][name].[ext]?[hash:7]'
          }
        }
      },

      {
        test: /\.(svg|woff|otf|woff2|ttf|eot)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            publicPath: '../',
            name: 'font/[name].[ext]?[hash:7]'
          }
        }
      }
    ]
  },

  optimization: {
    splitChunks: {
      minChunks: 2,
      chunks: 'all',
      cacheGroups: {
        default: false,
        venders: false,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor'
        }
      }
    },
    runtimeChunk: {
      name: 'runtime'
    }
  },

  plugins: [
    new VueLoaderPlugin(),
    extractScss,
    ...htmlTemplates
  ]
};

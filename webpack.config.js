const path = require('path');
//const glob = require("glob")
//const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
//const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');

module.exports = {
    mode: 'development',
    entry: './src/game.ts',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  };

  /*
    entry: {
      'bundle.js': [
        path.resolve(__dirname, 'out/game.js'),
        path.resolve(__dirname, 'out/sprite.js')
      ]
    },
    output: {
      filename: '[name]',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        */
        /*
        // somehow the following expose-loader declaration doesn't work
        // https://github.com/webpack-contrib/expose-loader/issues/51
        {
          test: require.resolve('jquery'),
          use: [{
              loader: 'expose-loader',
              options: '$'
          }]
        }
    }
}
*/
//    entry: {
//        "bundle.js": glob.sync("main.*.?js").map(f => path.resolve(__dirname, f)),
//    },

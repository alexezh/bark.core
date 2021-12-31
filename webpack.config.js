var DeclarationBundlerPlugin = require('types-webpack-bundler');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/game.ts',
  devtool: 'inline-source-map',
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
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new DeclarationBundlerPlugin({
      moduleName: 'barkcore',
      out: './index.d.ts',
    })
  ]
};

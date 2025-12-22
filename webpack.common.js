const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/scripts/index.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      // ⚠️ KITA MENGHAPUS BAGIAN CSS DISINI UNTUK MENCEGAH KONFLIK ⚠️
      // Biarkan webpack.dev.js yang mengurus CSS.
      
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public/'),
          to: path.resolve(__dirname, 'dist/'),
        },
        {
          // Pastikan file sw.js benar-benar ada di root folder project
          from: path.resolve(__dirname, 'sw.js'),
          to: path.resolve(__dirname, 'dist/sw.js'),
        },
      ],
    }),
  ],
};
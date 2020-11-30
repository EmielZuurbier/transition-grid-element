const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
		terserOptions: {
			mangle: true,
			module: true,
			toplevel: false,
			ie8: false,
			keep_classnames: true,
			keep_fnames: true,
			safari10: false,
		},
	})],
  },
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
    extensions: [ '.ts', '.js' ],
  },
  output: {
    filename: 'transition-grid-element.js',
    path: path.resolve(__dirname, 'dist'),
  },
  watchOptions: {
    ignored: /node_modules/
  }
};
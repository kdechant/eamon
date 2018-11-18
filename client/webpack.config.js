const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require('path');

const htmlPluginMainHall = new HtmlWebPackPlugin({
  template: "./public/index.html",
  filename: "./main-hall.html"
});
// TODO: add another one for core (if needed)

let entry_scripts = {
    'main-hall': './main-hall/index.tsx',
    'core': './core/index.tsx'
};
// Each subfolder of this 'adventures' folder is its own bundle. Use glob to find every
// subfolder that has an 'index.ts' file and add each one to our entry script.
// The result will be a file named 'folder1.js' with the contents of folder1,
// and 'folder2.js' with the contents of folder2, etc.
const glob = require('glob');
for (let file of glob.sync('adventures/**/index.ts')) {
  let name = file.split('/')[0];
  entry_scripts[name] = './' + file;
}

module.exports = {
  entry: entry_scripts,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      }
    ]
  },
  resolve: {
    extensions: [ '.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.wasm' ]
  },
  output: {
      // TODO: look at using file hashes for cache busting. Though that might be easier to do in Django's staticfiles.
    filename: '[name].js',   // replace [name] with the key of the object from 'entry' above.
    path: path.resolve(__dirname, './build/static'),
    libraryTarget: "var", // puts the exports in a var (other options are 'window', 'global', and many others)
    library: "Adventure"  // the name of the exported variable.
  },
  plugins: [
      htmlPluginMainHall
  ],
};

const path = require('path');

// Each subfolder of this 'extra' folder is its own bundle. Use glob to find every
// subfolder that has an 'index.ts' file and add each one to our entry script.
// The result will be a file named 'folder1.js' with the contents of folder1,
// and 'folder2.js' with the contents of folder2, etc.
const glob = require('glob');
let entry_scripts = {};
for (let file of glob.sync('**/index.ts')) {
  let name = file.split('/')[0];
  entry_scripts[name] = './' + file;
}

module.exports = {
  entry: entry_scripts,
  module: {
    rules: [
      {
        use: 'ts-loader',
        exclude: [
            path.resolve(__dirname, '../node_modules/'),
            path.resolve(__dirname, 'princes-tavern/*.spec.ts')
        ]
      }
    ]
  },
  resolve: {
    extensions: [ '.ts' ]
  },
  output: {
    filename: '[name].js',   // replace [name] with the key of the object from 'entry' above.
    path: path.resolve(__dirname, '../dist/adventures'),
    libraryTarget: "var", // puts the exports in a var (other options are 'window', 'global', and many others)
    library: "Adventure"  // the name of the exported variable.
  }
};

// Commit only the browser files used by the branch-based GitHub Pages build.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'node_modules/reveal.js');
const target = path.join(root, 'assets/reveal');
const files = ['LICENSE', 'dist/reset.css', 'dist/reveal.css', 'dist/reveal.js',
  'dist/theme/moon.css', 'dist/plugin/markdown.js', 'dist/plugin/highlight.js',
  'dist/plugin/highlight/monokai.css', 'dist/plugin/notes.js'];
const check = process.argv.includes('--check');
const version = JSON.parse(fs.readFileSync(path.join(source, 'package.json'))).version;
const expected = JSON.parse(fs.readFileSync(path.join(root, 'package.json'))).dependencies['reveal.js'];
assert.equal(version, expected, 'Installed reveal.js must match package.json');
for (const file of files) {
  const data = fs.readFileSync(path.join(source, file));
  const destination = path.join(target, file);
  if (check) assert.deepEqual(fs.readFileSync(destination), data, file + ': run npm run assets');
  else {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, data);
  }
}
function list(dir, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const name = prefix + entry.name;
    return entry.isDirectory() ? list(path.join(dir, entry.name), name + '/') : [name];
  });
}
assert.deepEqual(list(target).sort(), [...files].sort(), 'Unexpected vendored assets; review obsolete files');
console.log((check ? 'Verified' : 'Copied') + ' reveal.js ' + version + ': ' + files.length + ' browser assets');

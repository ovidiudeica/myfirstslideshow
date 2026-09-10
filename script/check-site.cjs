// Check generated HTML and local CSS dependencies without network requests.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(process.argv[2] || '_site');
const baseurl = process.argv[3] || '';
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
let count = 0;
function check(url, file) {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)) return;
  url = decodeURIComponent(url.split(/[?#]/)[0]);
  if (!url) return;
  let target;
  if (url.startsWith('/')) {
    assert.ok(!baseurl || url.startsWith(baseurl + '/'), file + ': wrong baseurl: ' + url);
    target = path.join(root, url.slice(baseurl.length));
  } else target = path.resolve(path.dirname(file), url);
  assert.ok(target.startsWith(root + path.sep), 'Asset escapes site: ' + url);
  assert.ok(fs.existsSync(target), file + ': missing local file ' + url);
  count++;
}
for (const file of files(root)) {
  if (!/\.(html|css)$/.test(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  assert.ok(!text.includes('node_modules/'), file + ': installed packages must not be public assets');
  if (file.endsWith('.html')) {
    assert.ok(!text.includes('{%') && !text.includes('{{'), file + ': unrendered Liquid');
    for (const match of text.matchAll(/<(?:script|link|img)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/gi)) check(match[1], file);
  } else {
    for (const match of text.matchAll(/url\(\s*["']?([^"'\s)]+)["']?\s*\)/gi)) check(match[1], file);
  }
}
for (const name of ['node_modules', 'script', 'package.json', 'package-lock.json', 'Gemfile']) {
  assert.ok(!fs.existsSync(path.join(root, name)), name + ' must not be published');
}
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.ok(index.includes('class="slides"'), 'Presentation container missing');
const postCount = fs.readdirSync(path.join(__dirname, '../_posts')).filter(f => /\.md$/.test(f)).length;
assert.equal((index.match(/<section\b/g) || []).length, postCount, 'Slide count differs from posts');
console.log('Validated ' + postCount + ' slides and ' + count + ' local asset references at baseurl "' + baseurl + '"');

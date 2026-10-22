// Adds a content hash to the styles.css / app.js links in index.html (e.g. app.js?v=1a2b3c4d5e),
// so browsers fetch the new files right after a build instead of reusing a cached copy.
const fs = require('fs');
const crypto = require('crypto');

const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 10);

let html = fs.readFileSync('index.html', 'utf8');
for (const file of ['styles.css', 'app.js']) {
  const pattern = new RegExp(`${file.replace('.', '\\.')}(\\?v=[0-9a-f]+)?"`);
  if (!pattern.test(html)) throw new Error(`index.html has no link to ${file}`);
  html = html.replace(pattern, `${file}?v=${hash(file)}"`);
}
fs.writeFileSync('index.html', html);
console.log('index.html stamped');

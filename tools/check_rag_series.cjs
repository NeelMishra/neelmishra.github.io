/* Run with Node: node tools/check_rag_series.cjs */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const chapters = JSON.parse(fs.readFileSync(path.join(root, 'blog/rag/series.json'), 'utf8')).chapters;
function registry(tree, posts) {
  const context = {};
  vm.runInNewContext(tree.slice(0, tree.indexOf('\n];') + 3), context);
  vm.runInNewContext(posts, context);
  return JSON.parse(JSON.stringify({tree: context.BLOG_TREE, posts: context.BLOG_POSTS}));
}
const current = registry(fs.readFileSync(path.join(root, 'blog.js'), 'utf8'),
                         fs.readFileSync(path.join(root, 'blog-posts.js'), 'utf8'));
const gitOptions = {cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024};
const before = registry(execFileSync('git', ['show', 'HEAD:blog.js'], gitOptions),
                        execFileSync('git', ['show', 'HEAD:blog-posts.js'], gitOptions));
const withoutRag = data => ({
  tree: data.tree.filter(node => node.name !== 'rag'),
  posts: Object.fromEntries(Object.entries(data.posts).filter(([, post]) => post.category !== 'rag'))
});
assert.deepEqual(withoutRag(current), withoutRag(before), 'An unrelated registry changed');
const flatten = node => node.file ? [node.file] : node.children.flatMap(flatten);
const category = current.tree.find(node => node.name === 'rag');
assert(category, 'Missing RAG category');
const files = flatten(category);
assert.equal(files.length, new Set(files).size, 'Duplicate RAG Explorer entries');
assert.deepEqual(files, chapters.map(chapter => chapter.file), 'Manifest and reading order differ');
assert.deepEqual([...files].sort(), Object.keys(current.posts).filter(file => current.posts[file].category === 'rag').sort());
let references = 0;
for (const chapter of chapters) {
  const file = path.join(root, 'blog', chapter.file);
  const html = fs.readFileSync(file, 'utf8');
  const metadata = current.posts[chapter.file];
  assert.equal(metadata.title, chapter.title);
  assert.equal(metadata.description, chapter.description);
  assert.equal(metadata.series, chapter.series);
  assert(html.includes(`<h1>${chapter.title}</h1>`), `Title mismatch: ${chapter.file}`);
  assert(html.includes(`name="description" content="${chapter.description}"`), chapter.file);
  assert(html.includes(`href="https://neelmishra.github.io/blog/${chapter.file}"`), `Canonical mismatch: ${chapter.file}`);
  assert(html.includes(`${chapter.minutes} min read`), `Reading time mismatch: ${chapter.file}`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `Duplicate IDs: ${chapter.file}`);
  assert(!/\binterview(?:s|ing)?\b/i.test(html), `Unwanted framing: ${chapter.file}`);
  for (const [, reference] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = new URL(reference, 'https://local.example/blog/' + chapter.file);
    if (url.origin !== 'https://local.example') continue;
    const target = path.join(root, decodeURIComponent(url.pathname));
    assert(fs.existsSync(target), `Missing local reference: ${chapter.file} -> ${reference}`);
    if (url.hash && target.endsWith('.html')) {
      assert(fs.readFileSync(target, 'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),
             `Missing anchor: ${chapter.file} -> ${reference}`);
    }
    references++;
  }
}
const benchmarkPage = path.join(root, 'blog/rag/ann-methods/hnsw/tuning-and-benchmarks.html');
if (fs.existsSync(benchmarkPage)) {
  const html = fs.readFileSync(benchmarkPage, 'utf8');
  const data = JSON.parse(fs.readFileSync(path.join(root, 'blog/rag/ann-methods/hnsw/assets/benchmark-results.json'), 'utf8'));
  const flat = html.match(/<tr data-flat-benchmark>([\s\S]*?)<\/tr>/);
  assert(flat, 'Missing exact flat benchmark row');
  for (const value of [data.flat_baseline.recall_at_10.toFixed(4),
                       data.flat_baseline.p95_ms.toFixed(4),
                       String(data.flat_baseline.serialized_bytes)]) {
    assert(flat[1].includes(value), 'Flat benchmark differs from the recorded result');
  }
  for (const row of data.rows) {
    const key = `${row.library}-${row.M}-${row.efConstruction}-${row.efSearch}`;
    const match = html.match(new RegExp(`<tr data-benchmark="${key}">([\\s\\S]*?)</tr>`));
    assert(match, `Missing benchmark row: ${key}`);
    assert(match[1].includes(row.recall_at_10.toFixed(4)), `Recall differs from recorded result: ${key}`);
    assert(match[1].includes(row.p95_ms.toFixed(4)), `Timing differs from recorded result: ${key}`);
    assert(match[1].includes(String(row.serialized_bytes)), `File size differs: ${key}`);
  }
}
console.log(`RAG checks passed: ${chapters.length} published pages, ${references} local references, exact registry coverage, and unchanged other categories.`);

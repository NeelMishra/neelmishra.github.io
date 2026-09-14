// Run with: node tools/check_ml_navigation.mjs
// Keep the reading DAG, Explorer, metadata and chapter navigation consistent.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = {};
const source = fs.readFileSync(path.join(root, 'blog.js'), 'utf8');
vm.runInNewContext(source.slice(0, source.indexOf('\n];') + 3), context);
vm.runInNewContext(fs.readFileSync(path.join(root, 'blog-posts.js'), 'utf8'), context);
const ml = context.BLOG_TREE.find(n => n.name === 'ml');
const flatten = n => n.file ? [n.file] : n.children.flatMap(flatten);
const files = flatten(ml);
assert.equal(files.length, new Set(files).size, 'An ML article occurs twice in the Explorer');
assert.equal(files[0], 'ml/index.html', 'The learning map should be the entry point');
for (const file of files) {
  assert(fs.existsSync(path.join(root, 'blog', file)), `Missing article: ${file}`);
  assert.equal(context.BLOG_POSTS[file]?.category, 'ml', `Missing ML metadata: ${file}`);
  assert(!context.BLOG_POSTS[file].draft, `Draft in the published ML path: ${file}`);
}
const published = Object.keys(context.BLOG_POSTS).filter(file => context.BLOG_POSTS[file].category === 'ml' && !context.BLOG_POSTS[file].draft);
assert.deepEqual([...files].sort(), published.sort(), 'Published ML metadata and Explorer coverage differ');

function scan(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? scan(p) : p.endsWith('.html') ? [p] : [];
  });
}
for (const file of scan(path.join(root, 'blog/ml'))) {
  const html = fs.readFileSync(file, 'utf8');
  // A legacy CS336 URL redirects to its canonical Deep Learning location.
  if (/<meta\b[^>]*http-equiv="refresh"/i.test(html)) continue;
  assert(files.includes(path.relative(path.join(root, 'blog'), file)), `Article missing from Explorer: ${file}`);
}

const topics = ml.children.filter(n => n.learning);
const order = new Map(topics.map((topic, i) => [topic.name, i]));
const complete = new Set(), visiting = new Set();
function visit(topic) {
  assert(!visiting.has(topic.name), `Prerequisite cycle at ${topic.name}`);
  if (complete.has(topic.name)) return;
  visiting.add(topic.name);
  assert(flatten(topic).includes(topic.learning.start), `Entry page outside topic: ${topic.name}`);
  assert.equal(topic.learning.requires.length, new Set(topic.learning.requires).size, `Repeated prerequisite: ${topic.name}`);
  for (const required of topic.learning.requires) {
    assert(order.has(required), `Unknown prerequisite: ${required}`);
    visit(topics[order.get(required)]);
    assert(order.get(required) < order.get(topic.name), `${required} must precede ${topic.name}`);
  }
  visiting.delete(topic.name);
  complete.add(topic.name);
}
topics.forEach(visit);

function checkSequence(folder, names) {
  const expected = names.map(name => `${folder}/${name}.html`);
  const actual = files.filter(file => path.posix.dirname(file) === folder);
  assert.deepEqual([...actual], expected, `Wrong reading sequence: ${folder}`);
  names.forEach((name, i) => {
    const file = expected[i];
    const html = fs.readFileSync(path.join(root, 'blog', file), 'utf8');
    const nav = html.match(/<nav\b[^>]*class="post-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    assert(nav, `Missing chapter navigation: ${file}`);
    if (i) assert(nav.includes(`class="prev" href="${names[i - 1]}.html"`), `Wrong previous chapter: ${file}`);
    if (i + 1 < names.length) assert(nav.includes(`class="next" href="${names[i + 1]}.html"`), `Wrong next chapter: ${file}`);
    const breadcrumb = html.match(/<div class="post-series-nav">([\s\S]*?)<\/div>/)?.[1];
    assert(breadcrumb?.includes(`Part ${i + 1}`), `Wrong visible part number: ${file}`);
    assert(context.BLOG_POSTS[file].series.includes(`Part ${i + 1}`), `Wrong metadata part number: ${file}`);
  });
}
checkSequence('ml/explainability/shap-lime', ['lime-local-surrogates', 'shapley-values', 'kernel-shap', 'index', 'choosing-explainers']);
const explainabilityGuide = fs.readFileSync(path.join(root, 'blog/ml/explainability/index.html'), 'utf8');
assert(explainabilityGuide.includes('class="next" href="shap-lime/lime-local-surrogates.html"'), 'Start explainability with the LIME lesson, before the comparison');
const limeLesson = fs.readFileSync(path.join(root, 'blog/ml/explainability/shap-lime/lime-local-surrogates.html'), 'utf8');
assert(limeLesson.includes('class="prev" href="../index.html"'), 'The first lesson should return to the parent guide, not the later comparison');
checkSequence('ml/explainability/tree-shap', ['index', 'path-contributions', 'why-tree-shap', 'ensembles-and-global', 'limitations']);
checkSequence('ml/loss-functions/js-divergence', ['index', 'properties-and-uses', 'gan-connection']);

const prep = ml.children.find(n => n.name === 'data-preparation');
const prepNames = prep.children.filter(n => n.children).map(n => n.name);
const prepHTML = fs.readFileSync(path.join(root, 'blog/ml/data-preparation/index.html'), 'utf8');
const prepList = prepHTML.match(/<ul class="prep-map">([\s\S]*?)<\/ul>/)[1];
assert.deepEqual([...prepList.matchAll(/href="([^/]+)\/index.html"/g)].map(m => m[1]), [...prepNames], 'Data-preparation guide and Explorer order differ');
console.log(`ML navigation passed: ${files.length} articles, ${topics.length} prerequisite nodes, acyclic order, complete coverage and consistent chapter navigation.`);

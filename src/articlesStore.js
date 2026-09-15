const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, '..', 'data', 'articles.json');

const CATEGORIES = [
  { key: 'news', label: '最新消息' },
  { key: 'private', label: '私中升學專欄' },
  { key: 'study', label: '學習園地' },
];

function readAll() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

// Simple write queue so concurrent admin edits never interleave and corrupt the file.
let writeQueue = Promise.resolve();
function writeAll(articles) {
  writeQueue = writeQueue.then(
    () =>
      new Promise((resolve, reject) => {
        const tmpFile = `${DATA_FILE}.${process.pid}.${Date.now()}.tmp`;
        fs.writeFile(tmpFile, JSON.stringify(articles, null, 2), 'utf-8', (err) => {
          if (err) return reject(err);
          fs.rename(tmpFile, DATA_FILE, (err2) => (err2 ? reject(err2) : resolve()));
        });
      })
  );
  return writeQueue;
}

function slugify(title) {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return base || crypto.randomUUID().slice(0, 8);
}

function uniqueSlug(title, articles, excludeId) {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (articles.some((a) => a.slug === slug && a.id !== excludeId)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

function listPublic(category) {
  const all = readAll()
    .filter((a) => a.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  if (category) return all.filter((a) => a.category === category);
  return all;
}

function getPublicBySlug(slug) {
  return readAll().find((a) => a.slug === slug && a.published) || null;
}

function listAll() {
  return readAll().sort((a, b) => (a.date < b.date ? 1 : -1));
}

function getById(id) {
  return readAll().find((a) => a.id === id) || null;
}

async function create(data) {
  const articles = readAll();
  const id = crypto.randomUUID();
  const article = {
    id,
    slug: uniqueSlug(data.title, articles),
    category: data.category,
    title: data.title,
    excerpt: data.excerpt || '',
    contentMarkdown: data.contentMarkdown || '',
    contentHtml: data.contentHtml || '',
    date: data.date || new Date().toISOString().slice(0, 10),
    published: !!data.published,
  };
  articles.push(article);
  await writeAll(articles);
  return article;
}

async function update(id, data) {
  const articles = readAll();
  const idx = articles.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const existing = articles[idx];
  const updated = {
    ...existing,
    category: data.category ?? existing.category,
    title: data.title ?? existing.title,
    excerpt: data.excerpt ?? existing.excerpt,
    contentMarkdown: data.contentMarkdown ?? existing.contentMarkdown,
    contentHtml: data.contentHtml ?? existing.contentHtml,
    date: data.date ?? existing.date,
    published: data.published ?? existing.published,
  };
  if (data.title && data.title !== existing.title) {
    updated.slug = uniqueSlug(data.title, articles, id);
  }
  articles[idx] = updated;
  await writeAll(articles);
  return updated;
}

async function remove(id) {
  const articles = readAll();
  const next = articles.filter((a) => a.id !== id);
  if (next.length === articles.length) return false;
  await writeAll(next);
  return true;
}

module.exports = {
  CATEGORIES,
  listPublic,
  getPublicBySlug,
  listAll,
  getById,
  create,
  update,
  remove,
};

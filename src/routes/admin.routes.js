const express = require('express');
const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');
const store = require('../articlesStore');
const { requireAdmin } = require('../auth');

const router = express.Router();
router.use(requireAdmin);

function renderMarkdown(markdown) {
  const raw = marked.parse(markdown || '', { breaks: true });
  return sanitizeHtml(raw, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title'],
      a: ['href', 'name', 'target', 'rel'],
    },
  });
}

function validateCreate(body) {
  const errors = [];
  if (!body.title || !body.title.trim()) errors.push('標題不可為空');
  if (!body.category || !store.CATEGORIES.some((c) => c.key === body.category)) {
    errors.push('分類不正確');
  }
  if (body.date && !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    errors.push('日期格式須為 YYYY-MM-DD');
  }
  return errors;
}

// Update payloads may be partial (e.g. only toggling `published`), so only
// validate fields that were actually sent instead of requiring the full set.
function validateUpdate(body) {
  const errors = [];
  if (body.title !== undefined && !body.title.trim()) errors.push('標題不可為空');
  if (body.category !== undefined && !store.CATEGORIES.some((c) => c.key === body.category)) {
    errors.push('分類不正確');
  }
  if (body.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    errors.push('日期格式須為 YYYY-MM-DD');
  }
  return errors;
}

router.get('/articles', (req, res) => {
  res.json(store.listAll());
});

router.get('/articles/:id', (req, res) => {
  const article = store.getById(req.params.id);
  if (!article) return res.status(404).json({ error: '找不到這篇文章' });
  res.json(article);
});

router.post('/articles', async (req, res) => {
  const errors = validateCreate(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join('、') });

  const contentMarkdown = req.body.contentMarkdown || '';
  const article = await store.create({
    title: req.body.title.trim(),
    category: req.body.category,
    excerpt: (req.body.excerpt || '').trim(),
    contentMarkdown,
    contentHtml: renderMarkdown(contentMarkdown),
    date: req.body.date,
    published: !!req.body.published,
  });
  res.status(201).json(article);
});

router.put('/articles/:id', async (req, res) => {
  const errors = validateUpdate(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join('、') });

  const contentMarkdown = req.body.contentMarkdown ?? undefined;
  const updated = await store.update(req.params.id, {
    title: req.body.title && req.body.title.trim(),
    category: req.body.category,
    excerpt: req.body.excerpt !== undefined ? req.body.excerpt.trim() : undefined,
    contentMarkdown,
    contentHtml: contentMarkdown !== undefined ? renderMarkdown(contentMarkdown) : undefined,
    date: req.body.date,
    published: req.body.published !== undefined ? !!req.body.published : undefined,
  });
  if (!updated) return res.status(404).json({ error: '找不到這篇文章' });
  res.json(updated);
});

router.delete('/articles/:id', async (req, res) => {
  const ok = await store.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: '找不到這篇文章' });
  res.json({ ok: true });
});

module.exports = router;

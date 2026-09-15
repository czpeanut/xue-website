const express = require('express');
const store = require('../articlesStore');

const router = express.Router();

// Public, read-only endpoints consumed by the static site's news pages.

router.get('/categories', (req, res) => {
  res.json(store.CATEGORIES);
});

router.get('/articles', (req, res) => {
  const { category } = req.query;
  res.json(store.listPublic(category));
});

router.get('/articles/:slug', (req, res) => {
  const article = store.getPublicBySlug(req.params.slug);
  if (!article) return res.status(404).json({ error: '找不到這篇文章' });
  res.json(article);
});

module.exports = router;

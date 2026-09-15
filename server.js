require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const authRoutes = require('./src/routes/auth.routes');
const articlesRoutes = require('./src/routes/articles.routes');
const adminApiRoutes = require('./src/routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(express.json());

app.use(
  session({
    name: 'xue.sid',
    secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8, // 8 小時
    },
  })
);

// ---- Public API (used by the static site's news/article pages) ----
app.use('/api', authRoutes);
app.use('/api', articlesRoutes);

// ---- Admin API (requires login, enforced inside admin.routes.js) ----
app.use('/api/admin', adminApiRoutes);

// ---- Admin panel static pages, gated so only the login page is public ----
function adminPageGuard(req, res, next) {
  const isPublicAsset =
    req.path === '/login.html' || req.path.startsWith('/css/') || req.path.startsWith('/js/');
  if (isPublicAsset) return next();
  if (req.session && req.session.isAdmin) return next();
  return res.redirect('/admin/login.html');
}
app.use('/admin', adminPageGuard, express.static(path.join(__dirname, 'admin')));

// ---- Public static marketing site ----
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
  console.log(`粹學文理補習班網站已啟動：http://localhost:${PORT}`);
  console.log(`後台管理入口：http://localhost:${PORT}/admin/login.html`);
});

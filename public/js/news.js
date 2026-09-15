// 最新消息列表頁：讀取文章 API、依分類切換
(function () {
  var listEl = document.getElementById('news-list');
  var tabsEl = document.getElementById('news-tabs');
  if (!listEl || !tabsEl) return;

  var categories = [];
  var currentCategory = '';

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    return (dateStr || '').replace(/-/g, '.');
  }

  function renderTabs() {
    var buttons = [
      '<button class="tab-btn' + (currentCategory === '' ? ' active' : '') + '" data-cat="">全部</button>',
    ];
    categories.forEach(function (c) {
      buttons.push(
        '<button class="tab-btn' +
          (currentCategory === c.key ? ' active' : '') +
          '" data-cat="' +
          c.key +
          '">' +
          escapeHtml(c.label) +
          '</button>'
      );
    });
    tabsEl.innerHTML = buttons.join('');
    tabsEl.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentCategory = btn.getAttribute('data-cat');
        renderTabs();
        loadArticles();
      });
    });
  }

  function renderArticles(articles) {
    if (!articles.length) {
      listEl.innerHTML = '<div class="empty-state">目前這個分類還沒有文章。</div>';
      return;
    }
    listEl.innerHTML = articles
      .map(function (a) {
        return (
          '<a class="card card-link" href="article.html?slug=' +
          encodeURIComponent(a.slug) +
          '">' +
          '<span class="card-date">' +
          formatDate(a.date) +
          '</span>' +
          '<h4>' +
          escapeHtml(a.title) +
          '</h4>' +
          '<p>' +
          escapeHtml(a.excerpt) +
          '</p>' +
          '</a>'
        );
      })
      .join('');
  }

  function loadArticles() {
    var url = '/api/articles' + (currentCategory ? '?category=' + encodeURIComponent(currentCategory) : '');
    fetch(url)
      .then(function (res) { return res.json(); })
      .then(renderArticles)
      .catch(function () {
        listEl.innerHTML = '<div class="empty-state">文章載入失敗，請稍後再試。</div>';
      });
  }

  fetch('/api/categories')
    .then(function (res) { return res.json(); })
    .then(function (cats) {
      categories = cats;
      renderTabs();
      loadArticles();
    })
    .catch(function () {
      loadArticles();
    });
})();

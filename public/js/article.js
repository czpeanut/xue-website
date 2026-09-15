// 文章內頁：依網址 ?slug= 讀取單篇文章內容
(function () {
  var container = document.getElementById('article-container');
  if (!container) return;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  var params = new URLSearchParams(window.location.search);
  var slug = params.get('slug');

  if (!slug) {
    container.innerHTML = '<div class="empty-state">找不到這篇文章。</div>';
    return;
  }

  fetch('/api/articles/' + encodeURIComponent(slug))
    .then(function (res) {
      if (!res.ok) throw new Error('not found');
      return res.json();
    })
    .then(function (article) {
      document.title = article.title + '｜粹學文理補習班';
      container.innerHTML =
        '<h1>' +
        escapeHtml(article.title) +
        '</h1>' +
        '<div class="article-meta">' +
        (article.date || '').replace(/-/g, '.') +
        '</div>' +
        '<div class="article-content">' +
        article.contentHtml +
        '</div>';
    })
    .catch(function () {
      container.innerHTML = '<div class="empty-state">找不到這篇文章，可能已被下架或網址有誤。</div>';
    });
})();

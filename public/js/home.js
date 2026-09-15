// 首頁最新消息預覽（取最新 3 篇）
(function () {
  var el = document.getElementById('home-news-preview');
  if (!el) return;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  fetch('/api/articles')
    .then(function (res) { return res.json(); })
    .then(function (articles) {
      var top = articles.slice(0, 3);
      if (!top.length) {
        el.innerHTML = '<div class="empty-state">目前尚無最新消息。</div>';
        return;
      }
      el.innerHTML = top
        .map(function (a) {
          return (
            '<a class="card card-link" href="article.html?slug=' +
            encodeURIComponent(a.slug) +
            '">' +
            '<span class="card-date">' +
            (a.date || '').replace(/-/g, '.') +
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
    })
    .catch(function () {
      el.innerHTML = '<div class="empty-state">文章載入失敗。</div>';
    });
})();

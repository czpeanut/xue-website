(function () {
  var CATEGORY_LABELS = { news: '最新消息', private: '私中升學專欄', study: '學習園地' };
  var rowsEl = document.getElementById('article-rows');

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function loadMe() {
    AdminAPI.get('/api/me').then(function (data) {
      if (data.loggedIn) {
        document.getElementById('whoami').textContent = '登入身分：' + data.username;
      }
    });
  }

  function renderRows(articles) {
    if (!articles.length) {
      rowsEl.innerHTML = '<tr><td colspan="5" class="empty-state">尚未建立任何文章</td></tr>';
      return;
    }
    rowsEl.innerHTML = articles
      .map(function (a) {
        return (
          '<tr>' +
          '<td>' + escapeHtml(a.title) + '</td>' +
          '<td><span class="tag-pill">' + (CATEGORY_LABELS[a.category] || a.category) + '</span></td>' +
          '<td>' + a.date + '</td>' +
          '<td><span class="status-pill ' + (a.published ? 'status-published' : 'status-draft') + '">' +
            (a.published ? '已發布' : '草稿') +
          '</span></td>' +
          '<td class="row-actions">' +
            '<a class="btn btn-outline btn-small" href="editor.html?id=' + a.id + '">編輯</a>' +
            '<button class="btn btn-danger btn-small" data-del="' + a.id + '">刪除</button>' +
          '</td>' +
          '</tr>'
        );
      })
      .join('');

    rowsEl.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!confirm('確定要刪除這篇文章嗎？此動作無法復原。')) return;
        AdminAPI.del('/api/admin/articles/' + btn.getAttribute('data-del'))
          .then(loadArticles)
          .catch(function (err) { alert(err.message); });
      });
    });
  }

  function loadArticles() {
    AdminAPI.get('/api/admin/articles')
      .then(renderRows)
      .catch(function (err) {
        rowsEl.innerHTML = '<tr><td colspan="5" class="empty-state">載入失敗：' + escapeHtml(err.message) + '</td></tr>';
      });
  }

  document.getElementById('logout-btn').addEventListener('click', function () {
    AdminAPI.post('/api/logout').then(function () {
      window.location.href = 'login.html';
    });
  });

  loadMe();
  loadArticles();
})();

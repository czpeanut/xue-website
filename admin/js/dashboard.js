(function () {
  var CATEGORY_LABELS = { news: '最新消息', private: '私中升學專欄', study: '學習園地' };
  var rowsEl = document.getElementById('article-rows');

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
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
        window.db
          .from('articles')
          .delete()
          .eq('id', btn.getAttribute('data-del'))
          .then(function (res) {
            if (res.error) return alert(res.error.message);
            loadArticles();
          })
          .catch(function (err) {
            alert(err.message || String(err));
          });
      });
    });
  }

  function loadArticles() {
    window.db
      .from('articles')
      .select('id, title, category, date, published')
      .order('date', { ascending: false })
      .then(function (res) {
        if (res.error) throw res.error;
        renderRows(res.data);
      })
      .catch(function (err) {
        rowsEl.innerHTML = '<tr><td colspan="5" class="empty-state">載入失敗：' + escapeHtml(err.message || String(err)) + '</td></tr>';
      });
  }

  document.getElementById('logout-btn').addEventListener('click', function () {
    window.db.auth.signOut().then(function () {
      window.location.href = 'login.html';
    });
  });

  window.AdminAuth.ready
    .then(function (session) {
      document.getElementById('whoami').textContent = '登入身分：' + session.user.email;
      loadArticles();
    })
    .catch(function () {});
})();

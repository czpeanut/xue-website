(function () {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  var errorEl = document.getElementById('editor-error');
  var form = document.getElementById('editor-form');

  var titleInput = document.getElementById('f-title');
  var categorySelect = document.getElementById('f-category');
  var dateInput = document.getElementById('f-date');
  var excerptInput = document.getElementById('f-excerpt');
  var contentInput = document.getElementById('f-content');
  var publishedInput = document.getElementById('f-published');

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  if (id) {
    document.getElementById('editor-title').textContent = '編輯文章';
    AdminAPI.get('/api/admin/articles/' + id)
      .then(function (a) {
        titleInput.value = a.title;
        categorySelect.value = a.category;
        dateInput.value = a.date;
        excerptInput.value = a.excerpt;
        contentInput.value = a.contentMarkdown;
        publishedInput.checked = a.published;
      })
      .catch(function (err) {
        errorEl.textContent = err.message;
      });
  } else {
    dateInput.value = todayStr();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorEl.textContent = '';

    var payload = {
      title: titleInput.value,
      category: categorySelect.value,
      date: dateInput.value,
      excerpt: excerptInput.value,
      contentMarkdown: contentInput.value,
      published: publishedInput.checked,
    };

    var req = id
      ? AdminAPI.put('/api/admin/articles/' + id, payload)
      : AdminAPI.post('/api/admin/articles', payload);

    req
      .then(function () {
        window.location.href = 'index.html';
      })
      .catch(function (err) {
        errorEl.textContent = err.message;
      });
  });
})();

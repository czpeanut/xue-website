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

  function slugify(title) {
    var base = title
      .trim()
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
      .replace(/^-+|-+$/g, '');
    return base || Math.random().toString(36).slice(2, 10);
  }

  // 找一個不會撞名的 slug（編輯現有文章時，排除自己）
  function uniqueSlug(title) {
    var base = slugify(title);
    function tryslug(candidate, n) {
      var query = window.db.from('articles').select('id').eq('slug', candidate);
      if (id) query = query.neq('id', id);
      return query.then(function (res) {
        if (res.error) throw res.error;
        if (!res.data.length) return candidate;
        return tryslug(base + '-' + n, n + 1);
      });
    }
    return tryslug(base, 2);
  }

  function loadExisting() {
    document.getElementById('editor-title').textContent = '編輯文章';
    window.db
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()
      .then(function (res) {
        if (res.error || !res.data) {
          errorEl.textContent = res.error ? res.error.message : '找不到這篇文章';
          return;
        }
        var a = res.data;
        titleInput.value = a.title;
        categorySelect.value = a.category;
        dateInput.value = a.date;
        excerptInput.value = a.excerpt;
        contentInput.value = a.content_markdown;
        publishedInput.checked = a.published;
      })
      .catch(function (err) {
        errorEl.textContent = err.message || String(err);
      });
  }

  window.AdminAuth.ready
    .then(function () {
      if (id) {
        loadExisting();
      } else {
        dateInput.value = todayStr();
      }
    })
    .catch(function () {});

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorEl.textContent = '';

    var title = titleInput.value.trim();
    if (!title) {
      errorEl.textContent = '標題不可為空';
      return;
    }

    var contentMarkdown = contentInput.value;
    var contentHtml = window.marked.parse(contentMarkdown || '', { breaks: true });

    var save = function (slug) {
      var payload = {
        title: title,
        category: categorySelect.value,
        date: dateInput.value,
        excerpt: excerptInput.value.trim(),
        content_markdown: contentMarkdown,
        content_html: contentHtml,
        published: publishedInput.checked,
      };
      var req;
      if (id) {
        if (slug) payload.slug = slug;
        req = window.db.from('articles').update(payload).eq('id', id);
      } else {
        payload.slug = slug;
        req = window.db.from('articles').insert(payload);
      }
      req
        .then(function (res) {
          if (res.error) throw res.error;
          window.location.href = 'index.html';
        })
        .catch(function (err) {
          errorEl.textContent = err.message || String(err);
        });
    };

    if (id) {
      // 編輯現有文章：標題沒變就不用重新產生 slug
      window.db
        .from('articles')
        .select('title')
        .eq('id', id)
        .single()
        .then(function (res) {
          if (res.data && res.data.title === title) {
            save(null);
          } else {
            uniqueSlug(title).then(save).catch(function (err) {
              errorEl.textContent = err.message || String(err);
            });
          }
        })
        .catch(function (err) {
          errorEl.textContent = err.message || String(err);
        });
    } else {
      uniqueSlug(title).then(save).catch(function (err) {
        errorEl.textContent = err.message || String(err);
      });
    }
  });
})();

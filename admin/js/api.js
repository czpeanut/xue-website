// 後台共用的 API 呼叫工具
window.AdminAPI = (function () {
  function request(method, url, body) {
    return fetch(url, {
      method: method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    }).then(function (res) {
      if (res.status === 401) {
        window.location.href = 'login.html';
        return Promise.reject(new Error('未登入'));
      }
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || '發生錯誤');
        return data;
      });
    });
  }

  return {
    get: function (url) { return request('GET', url); },
    post: function (url, body) { return request('POST', url, body); },
    put: function (url, body) { return request('PUT', url, body); },
    del: function (url) { return request('DELETE', url); },
  };
})();

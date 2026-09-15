// 後台頁面共用的登入檢查：沒有登入就導回登入頁。
// 真正的權限控管是 Supabase 的 Row Level Security（見 supabase/schema.sql），
// 這裡的檢查只是為了使用體驗（避免顯示空白的後台畫面）。
window.AdminAuth = {
  ready: window.db.auth.getSession().then(function (res) {
    if (!res.data.session) {
      window.location.href = 'login.html';
      return Promise.reject(new Error('未登入'));
    }
    return res.data.session;
  }),
};

// 建立共用的 Supabase client（需先載入 supabase-config.js 與 supabase-js CDN script）
window.db = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

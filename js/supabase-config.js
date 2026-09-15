// 把下面兩個值換成你自己 Supabase 專案的設定
// 位置：Supabase 專案後台 → Project Settings → API
//   Project URL      → 貼到 SUPABASE_URL
//   anon public key  → 貼到 SUPABASE_ANON_KEY
//
// 這兩個值是設計成可以公開的（不是密碼），實際的存取權限是由
// supabase/schema.sql 裡設定的 Row Level Security 規則控制。
window.SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
window.SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';

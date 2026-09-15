-- 粹學文理補習班網站｜Supabase 資料庫設定
-- 使用方式：到 Supabase 專案的 SQL Editor，貼上整份檔案後執行一次即可。

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text not null check (category in ('news', 'private', 'study')),
  title text not null,
  excerpt text default '',
  content_markdown text default '',
  content_html text default '',
  date date not null default current_date,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 開啟資料列安全性（Row Level Security），這是整個權限控管的核心：
-- 一般訪客（anon）只能讀「已發布」的文章；只有登入後台的管理員（authenticated）才能新增／編輯／刪除／看草稿。
alter table public.articles enable row level security;

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles"
  on public.articles for select
  to anon
  using (published = true);

drop policy if exists "Admin can read all articles" on public.articles;
create policy "Admin can read all articles"
  on public.articles for select
  to authenticated
  using (true);

drop policy if exists "Admin can insert articles" on public.articles;
create policy "Admin can insert articles"
  on public.articles for insert
  to authenticated
  with check (true);

drop policy if exists "Admin can update articles" on public.articles;
create policy "Admin can update articles"
  on public.articles for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin can delete articles" on public.articles;
create policy "Admin can delete articles"
  on public.articles for delete
  to authenticated
  using (true);

-- 自動維護 updated_at 欄位
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- 種子資料（示意用的初始文章，可以直接在後台編輯或刪除）
insert into public.articles (slug, category, title, excerpt, content_markdown, content_html, date, published)
values
  ('116-junior2-physics-chem-new-class', 'news', '升國二理化全新開班，超早鳥優惠開跑',
   '七月開課，把握暑假先修黃金期，超早鳥優惠限額報名中。',
   E'七月全新開班，針對升國二學生規劃理化先修課程，從觀念建立到實作演練，幫助孩子提前適應國二理化的學習節奏。\n\n即日起報名享超早鳥優惠，名額有限，額滿為止。',
   '<p>七月全新開班，針對升國二學生規劃理化先修課程，從觀念建立到實作演練，幫助孩子提前適應國二理化的學習節奏。</p><p>即日起報名享超早鳥優惠，名額有限，額滿為止。</p>',
   '2026-09-01', true),
  ('sunday-mock-exam-camp', 'news', '週日模考戰鬥營開放報名',
   '模擬會考情境，訓練考場節奏與時間掌控。',
   '週日模考戰鬥營以真實會考情境為藍本，讓學生提前熟悉考場節奏、掌握時間分配，考後並提供詳細檢討與弱點分析。',
   '<p>週日模考戰鬥營以真實會考情境為藍本，讓學生提前熟悉考場節奏、掌握時間分配，考後並提供詳細檢討與弱點分析。</p>',
   '2026-08-15', true),
  ('chemistry-evening-class', 'news', '化學黃昏班社群開課通知',
   '小班制黃昏時段開課，適合放學後銜接複習。',
   '化學黃昏班採小班制教學，安排於放學後的黃昏時段，讓學生能夠無縫銜接學校課程進行複習與加強。',
   '<p>化學黃昏班採小班制教學，安排於放學後的黃昏時段，讓學生能夠無縫銜接學校課程進行複習與加強。</p>',
   '2026-07-20', true),
  ('private-junior-high-exam-guide', 'private', '台南市國中資優班入學考重點整理',
   '整理歷年考科比重與命題方向，協助家長提早規劃。',
   '本文整理近年台南市國中資優班入學考的考科比重與命題方向，幫助家長及早掌握準備方向，安排合適的學習規劃。',
   '<p>本文整理近年台南市國中資優班入學考的考科比重與命題方向，幫助家長及早掌握準備方向，安排合適的學習規劃。</p>',
   '2026-08-10', true),
  ('private-school-interview-tips', 'private', '私中入學面試常見問題與準備方向',
   '從自我介紹到情境問答，掌握面試準備要點。',
   '私中入學面試常見的題型包括自我介紹、情境問答與臨場反應測驗。本文整理常見問題並提供準備建議，幫助孩子從容應對。',
   '<p>私中入學面試常見的題型包括自我介紹、情境問答與臨場反應測驗。本文整理常見問題並提供準備建議，幫助孩子從容應對。</p>',
   '2026-06-05', true),
  ('private-school-admission-timeline', 'private', '私中升學時程與報名注意事項',
   '彙整各校報名時間軸，避免錯過關鍵日期。',
   '本文彙整台南、高雄地區各私立中學的報名時程與注意事項，提醒家長留意關鍵日期，避免錯過報名機會。',
   '<p>本文彙整台南、高雄地區各私立中學的報名時程與注意事項，提醒家長留意關鍵日期，避免錯過報名機會。</p>',
   '2026-05-12', true),
  ('effective-study-schedule', 'study', '如何規劃有效的複習時間表',
   '從時間分配到弱點科目安排，建立可持續的複習節奏。',
   '有效的複習時間表應該考量每個科目的弱點比重，並保留彈性調整空間。本文提供實用的時間分配建議，幫助學生建立可持續的複習節奏。',
   '<p>有效的複習時間表應該考量每個科目的弱點比重，並保留彈性調整空間。本文提供實用的時間分配建議，幫助學生建立可持續的複習節奏。</p>',
   '2026-08-05', true),
  ('physics-chem-experiment-mistakes', 'study', '理化實驗題常見失分原因',
   '整理學生常犯錯誤類型，提供對應複習策略。',
   '理化實驗題常見的失分原因包括步驟順序混淆、單位換算錯誤等。本文整理常見錯誤類型，並提供對應的複習策略。',
   '<p>理化實驗題常見的失分原因包括步驟順序混淆、單位換算錯誤等。本文整理常見錯誤類型，並提供對應的複習策略。</p>',
   '2026-07-01', true),
  ('english-long-reading-tips', 'study', '英文長篇閱讀的答題技巧',
   '從關鍵字定位到段落邏輯判讀，提升閱讀速度與準確率。',
   '英文長篇閱讀測驗的關鍵在於快速定位關鍵字與掌握段落邏輯。本文分享實用技巧，幫助學生提升閱讀速度與答題準確率。',
   '<p>英文長篇閱讀測驗的關鍵在於快速定位關鍵字與掌握段落邏輯。本文分享實用技巧，幫助學生提升閱讀速度與答題準確率。</p>',
   '2026-06-10', true)
on conflict (slug) do nothing;

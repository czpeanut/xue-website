# 粹學文理官方網站

一個部署在 GitHub Pages 上的純靜態網站，搭配 [Supabase](https://supabase.com)（免費方案即可）提供密碼登入的後台，讓行政人員能自行編輯「最新消息」文章。

## 網站結構

- 根目錄（`index.html`、`about.html`、`courses.html`、`teachers.html`、`branches.html`、`news.html`、`article.html`）— 對外的靜態網站頁面。
- `css/`、`js/` — 網站共用的樣式與行為，`js/news.js`、`js/home.js`、`js/article.js` 會直接向 Supabase 讀取文章資料。
- `admin/` — 密碼登入後台，登入後可以新增、編輯、刪除、發布「最新消息」文章。
- `supabase/schema.sql` — 資料庫設定檔（建立文章資料表、權限規則、初始文章），只需要在 Supabase 執行一次。
- `.github/workflows/deploy-pages.yml` — GitHub Action，每次 push 到 `main` 分支就自動部署到 GitHub Pages。

這個網站**不需要自己維護任何伺服器**：靜態頁面由 GitHub Pages 免費託管，後台登入與文章資料由 Supabase 這個「後端即服務」平台代管。

## 第一次設定（大約 10 分鐘）

### 1. 建立 Supabase 專案

1. 到 [supabase.com](https://supabase.com) 註冊帳號，建立一個新專案（免費方案即可）。
2. 專案建立好後，進入左側選單 **SQL Editor**，貼上整份 `supabase/schema.sql` 的內容並執行。這會建立文章資料表、設定好權限規則，並匯入幾篇示意文章。
3. 到左側選單 **Authentication → Users**，點 **Add user**，建立一個管理員帳號：
   - Email：可以用任何 email 格式（例如 `admin@yourschool.com`，不需要是真的能收信的信箱）
   - Password：設定一組密碼
   - 記得勾選 **Auto Confirm User**，這樣就不需要收信驗證，馬上就能登入。
4. 到左側選單 **Project Settings → API**，複製兩個值：
   - **Project URL**
   - **anon public** key（不是 `service_role` key，那組是給伺服器用的，不要用在這裡）

### 2. 把 Supabase 設定填進網站

打開 `js/supabase-config.js`，把兩個值換成你剛剛複製的：

```js
window.SUPABASE_URL = 'https://xxxxxxxx.supabase.co';
window.SUPABASE_ANON_KEY = 'ey...（一長串）';
```

> 這兩個值雖然會出現在公開的網站原始碼裡，但這是 Supabase 設計上就允許公開的「匿名金鑰」，真正的安全防護是 `schema.sql` 裡設定的權限規則（只有登入的管理員能新增/編輯/刪除文章，一般訪客只能讀取已發布的文章）。

### 3. 開啟 GitHub Pages

1. 到 GitHub 這個 repo 的 **Settings → Pages**。
2. **Build and deployment → Source** 選擇 **GitHub Actions**。
3. 把上面「填好設定的 `js/supabase-config.js`」commit 並 push 到 `main` 分支，`.github/workflows/deploy-pages.yml` 就會自動執行部署。
4. 部署完成後，網址會顯示在 repo 的 **Settings → Pages** 頁面（通常是 `https://你的帳號.github.io/xue-website/`）。

之後每次 push 到 `main` 分支，網站都會自動重新部署。

## 後台怎麼用

1. 到 `你的網址/admin/login.html`，輸入剛剛在 Supabase 建立的管理員 Email 和密碼登入。
2. 登入後會看到文章列表，可以「新增文章」、「編輯」或「刪除」。
3. 文章內文支援簡單的 Markdown 語法：
   - 空一行＝分段
   - `# 標題文字` ＝標題
   - `**文字**` ＝粗體
   - `[連結文字](網址)` ＝超連結
4. 勾選「立即發布」文章才會顯示在官網的「最新消息」頁面；不勾選則存為草稿，只有後台看得到。
5. 後台編輯完成後**立即生效**，不需要等 GitHub Pages 重新部署（文章資料是即時從 Supabase 讀取的）。

## 本機預覽

因為是純靜態網站，本機測試不需要安裝任何套件，用任何簡易伺服器打開就能看：

```bash
npx serve .
```

打開顯示的網址即可預覽（記得先照上面步驟填好 `js/supabase-config.js`，否則文章列表會讀取失敗）。

## 之後要修改真實資料

- 「關於我們」「課程介紹」「師資介紹」「分校據點」「首頁」目前都還是示意用的假資料（補習班名稱、地址、電話、老師姓名），請直接編輯對應的 `.html` 檔案文字內容替換成真實資訊。
- 「最新消息」文章都透過後台管理，不需要改程式碼。

## 安全性備忘

- Supabase 的 anon key 設計上可以公開，不用當成密碼保護。
- 真正的存取權限完全由 `supabase/schema.sql` 裡的 Row Level Security 規則決定，如果之後想開放多個管理員帳號，直接到 Supabase 的 Authentication 頁面新增使用者即可，不用改任何程式碼。
- 如果要撤銷某個管理員的權限，到 Supabase Authentication 頁面刪除該使用者即可。

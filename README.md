# 粹學文理補習班官方網站

一個純靜態的補習班官方網站，並附加一個密碼登入的後台，讓行政人員能自行編輯「最新消息」文章。

## 網站結構

- `public/` — 對外的靜態網站（首頁、關於我們、課程介紹、師資介紹、分校據點、最新消息、文章內頁）。頁面本身是純 HTML/CSS/JS，最新消息的內容則透過 API 動態讀取，方便後台更新後即時反映在網站上。
- `admin/` — 密碼登入後台，用來新增、編輯、刪除、發布「最新消息」文章。
- `server.js` / `src/` — 提供登入驗證、文章 API 的 Node.js 後端。
- `data/articles.json` — 文章資料庫（純 JSON 檔案，後台編輯會直接寫入這個檔案）。

## 第一次啟動

```bash
npm install
cp .env.example .env
```

打開 `.env`，把以下兩行改成你自己的設定：

```
ADMIN_USERNAME=你想要的帳號
ADMIN_PASSWORD=你想要的密碼
SESSION_SECRET=一串隨機亂碼
```

`SESSION_SECRET` 可以用這個指令產生一串隨機字串：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

接著啟動伺服器：

```bash
npm start
```

- 官方網站：http://localhost:3000
- 後台登入：http://localhost:3000/admin/login.html

> 目前 `.env` 裡預設帳密是 `admin` / `changeme123`，**上線前務必修改**，否則任何人都能登入後台。

## 後台怎麼用

1. 到 `/admin/login.html` 輸入帳號密碼登入。
2. 登入後會看到文章列表，可以「新增文章」、「編輯」或「刪除」。
3. 文章內文支援簡單的 Markdown 語法：
   - 空一行＝分段
   - `# 標題文字` ＝標題
   - `**文字**` ＝粗體
   - `[連結文字](網址)` ＝超連結
4. 勾選「立即發布」文章才會顯示在官網的「最新消息」頁面；不勾選則存為草稿，只有後台看得到。

## 部署注意事項

- 這個網站需要一個能一直執行 Node.js 的主機（例如一般的 VPS、Render、Railway 等），不能像純靜態網站一樣直接丟到 GitHub Pages，因為後台登入與文章 API 都需要伺服器運作。
- 正式上線時建議：
  - 用 HTTPS（否則登入密碼會用明文傳輸）。
  - 修改 `.env` 內的帳號密碼與 `SESSION_SECRET`。
  - 定期備份 `data/articles.json`。
- 若未來想把「關於我們」「課程介紹」「師資介紹」「分校據點」等頁面的文字換成真實資料，直接編輯 `public/` 資料夾內對應的 `.html` 檔案即可（目前是示意用的假資料）。

## 開發時的指令

```bash
npm run dev   # 使用 --watch 模式啟動，檔案變動會自動重啟伺服器
```

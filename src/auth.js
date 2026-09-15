const bcrypt = require('bcryptjs');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';

if (!process.env.ADMIN_PASSWORD) {
  console.warn(
    '[警告] 未設定 ADMIN_PASSWORD 環境變數，目前使用預設密碼 "changeme123"。' +
      '請盡快建立 .env 檔並修改密碼，否則後台不安全！'
  );
}

const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

function verifyCredentials(username, password) {
  if (typeof username !== 'string' || typeof password !== 'string') return false;
  if (username !== ADMIN_USERNAME) return false;
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({ error: '尚未登入或登入已逾期，請重新登入' });
}

module.exports = { verifyCredentials, requireAdmin, ADMIN_USERNAME };

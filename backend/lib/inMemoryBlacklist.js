// lib/inMemoryBlacklist.js
// Map<jti, expUnix>
const bl = new Map();

function add(jti, expUnix) {
  bl.set(jti, expUnix);
}

function has(jti) {
  if (!jti) return false;
  const exp = bl.get(jti);
  if (!exp) return false;
  // tự dọn rác nếu đã quá hạn
  if (exp < Math.floor(Date.now()/1000)) {
    bl.delete(jti);
    return false;
  }
  return true;
}

// cleanup định kỳ
setInterval(() => {
  const now = Math.floor(Date.now()/1000);
  for (const [jti, exp] of bl.entries()) {
    if (exp < now) bl.delete(jti);
  }
}, 60_000);

module.exports = { add, has };

const bcrypt = require("bcryptjs");

async function encrypt(password) {
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

module.exports = encrypt;

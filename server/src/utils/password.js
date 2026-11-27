const bcrypt = require('bcryptjs');

let argon2 = null;
try {
  argon2 = require('argon2');
} catch (e) {
  // Argon2 native module unavailable in this environment
}

const hashPassword = async (password) => {
  if (argon2) {
    try {
      return await argon2.hash(password);
    } catch (e) {}
  }
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const verifyPassword = async (hash, password) => {
  if (!hash || !password) return false;
  if (hash.startsWith('$argon2')) {
    if (argon2) {
      try {
        return await argon2.verify(hash, password);
      } catch (e) {}
    }
    return false;
  }
  return bcrypt.compare(password, hash);
};

module.exports = { hashPassword, verifyPassword };

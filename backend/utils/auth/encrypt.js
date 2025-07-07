// FILE: backend/utils/auth/encrypt.js

const crypto = require('crypto');
const { encryptSecret } = require('../../env');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

// Validate secret key length
if (!encryptSecret || encryptSecret.length !== 32) {
  throw new Error('ENCRYPT_SECRET must be exactly 32 characters.');
}

// Encrypt a string using AES-256-CBC
const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(encryptSecret, 'utf8'),
    iv
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

// Decrypt a previously encrypted string
const decrypt = (encrypted) => {
  const [ivHex, data] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(encryptSecret, 'utf8'),
    iv
  );
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

module.exports = {
  encrypt,
  decrypt,
};

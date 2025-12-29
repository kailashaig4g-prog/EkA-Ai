const crypto = require('crypto');

const algorithm = 'aes-256-cbc';

/**
 * Encrypt text using AES-256-CBC
 * @param {string} text - Text to encrypt
 * @param {string} key - Encryption key (32 bytes)
 * @returns {string} Encrypted text in format iv:encrypted
 */
const encrypt = (text, key = process.env.ENCRYPTION_KEY || 'default-32-character-key-change') => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key.slice(0, 32)), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt text using AES-256-CBC
 * @param {string} text - Encrypted text in format iv:encrypted
 * @param {string} key - Decryption key (32 bytes)
 * @returns {string} Decrypted text
 */
const decrypt = (text, key = process.env.ENCRYPTION_KEY || 'default-32-character-key-change') => {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key.slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

/**
 * Generate random token
 * @param {number} length - Length of token in bytes
 * @returns {string} Random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash data using SHA-256
 * @param {string} data - Data to hash
 * @returns {string} Hashed data
 */
const hash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = {
  encrypt,
  decrypt,
  generateToken,
  hash,
};

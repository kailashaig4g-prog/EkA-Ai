const { encrypt, decrypt, hash, compare } = require('../../../src/utils/encryption');

describe('Encryption Utils', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt data correctly', () => {
      const data = 'sensitive information';
      const encrypted = encrypt(data);
      
      expect(encrypted).not.toBe(data);
      expect(encrypted).toContain(':'); // IV separator
      
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(data);
    });

    it('should handle empty strings', () => {
      const encrypted = encrypt('');
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe('');
    });

    it('should produce different encrypted values for same input', () => {
      const data = 'test data';
      const encrypted1 = encrypt(data);
      const encrypted2 = encrypt(data);
      
      // Different due to different IVs
      expect(encrypted1).not.toBe(encrypted2);
      
      // But both decrypt to same value
      expect(decrypt(encrypted1)).toBe(data);
      expect(decrypt(encrypted2)).toBe(data);
    });
  });

  describe('hash and compare', () => {
    it('should hash and compare passwords correctly', async () => {
      const password = 'SecurePass123!';
      const hashed = await hash(password);
      
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
      
      const isMatch = await compare(password, hashed);
      expect(isMatch).toBe(true);
    });

    it('should fail comparison with wrong password', async () => {
      const password = 'SecurePass123!';
      const wrongPassword = 'WrongPassword';
      const hashed = await hash(password);
      
      const isMatch = await compare(wrongPassword, hashed);
      expect(isMatch).toBe(false);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'SecurePass123!';
      const hash1 = await hash(password);
      const hash2 = await hash(password);
      
      // Different due to different salts
      expect(hash1).not.toBe(hash2);
      
      // But both should match
      expect(await compare(password, hash1)).toBe(true);
      expect(await compare(password, hash2)).toBe(true);
    });
  });
});

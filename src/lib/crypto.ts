import CryptoJS from 'crypto-js';

// We hash the raw binary string to generate a robust 256-bit AES key
export const deriveAESKey = (rawKey: string): string => {
  return CryptoJS.SHA256(rawKey).toString(CryptoJS.enc.Hex);
};

export const encryptMessage = (message: string, key: string): string => {
  if (!message || !key) return '';
  const encrypted = CryptoJS.AES.encrypt(message, key);
  return encrypted.toString();
};

export const decryptMessage = (ciphertext: string, key: string): string => {
  if (!ciphertext || !key) return '';
  try {
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return 'DECRYPTION_FAILED';
  }
};

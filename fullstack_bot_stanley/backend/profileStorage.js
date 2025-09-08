// profileStorage.js
import crypto from 'crypto';
import fs from 'fs';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here!!!!';
const ALGORITHM = 'aes-256-cbc';

// Encrypt sensitive data
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt sensitive data
function decrypt(encryptedData) {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Save user profile
export function saveUserProfile(userId, profileData) {
  // Encrypt sensitive payment info
  const encryptedProfile = {
    ...profileData,
    cardNumber: encrypt(profileData.cardNumber),
    cardCvv: encrypt(profileData.cardCvv)
  };
  
  // Save to file/database
  fs.writeFileSync(`./profiles/${userId}.json`, JSON.stringify(encryptedProfile));
}

// Load user profile
export function loadUserProfile(userId) {
  try {
    const profileData = JSON.parse(fs.readFileSync(`./profiles/${userId}.json`));
    
    // Decrypt sensitive data
    return {
      ...profileData,
      cardNumber: decrypt(profileData.cardNumber),
      cardCvv: decrypt(profileData.cardCvv)
    };
  } catch (error) {
    return null; // Profile doesn't exist
  }
}

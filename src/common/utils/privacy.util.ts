import { createHmac, createHash } from 'crypto';

export class PrivacyUtil {
  private static readonly HMAC_SECRET = process.env.HMAC_SECRET || 'SUPER_SECURE_HMAC_KEY_CHANGE_IN_PROD';

  /**
   * Normalizes input strings (trims, lowercases) to ensure deterministic hashing.
   */
  static normalizeInput(input: string): string {
    return input.trim().toLowerCase();
  }

  /**
   * Generates a deterministic SHA-256 HMAC for exact lookups without storing raw PII.
   */
  static hashInput(input: string): string {
    const normalized = this.normalizeInput(input);
    return createHmac('sha256', this.HMAC_SECRET).update(normalized).digest('hex');
  }

  /**
   * Generates k-Anonymity prefix (first 5 SHA-1 chars) specifically for password/email breach APIs.
   */
  static toKAnonymityPrefix(input: string): string {
    const sha1Hex = createHash('sha1').update(this.normalizeInput(input)).digest('hex').toUpperCase();
    return sha1Hex.substring(0, 5);
  }

  /**
   * Masks email strings (e.g., user@example.com -> u***r@example.com)
   */
  static maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    if (local.length <= 2) {
      return `${local[0]}***@${domain}`;
    }
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  }

  /**
   * Masks phone numbers (e.g., +919876543210 -> +91 ******3210)
   */
  static maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 7) return '******';
    const visibleSuffix = cleaned.slice(-4);
    const prefix = phone.startsWith('+') ? phone.slice(0, 3) : '';
    return `${prefix} ******${visibleSuffix}`;
  }
}

const PATTERNS = {
  upiIds: /[a-zA-Z0-9._-]+@(paytm|upi|oksbi|okhdfcbank|okaxis|okicici|ybl|ibl|ptyes|axl|kotak|apl|waicici|razorpay|freecharge|airtelpaymentsbank)/gi,
  phoneNumbers: /(\+91|0)?[6-9]\d{9}/g,
  bankAccounts: /\b\d{9,18}\b/g,
  ifscCodes: /[A-Z]{4}0[A-Z0-9]{6}/g,
  phishingUrls: /https?:\/\/[^\s]{8,}|bit\.ly\/[^\s]+|tinyurl\.com\/[^\s]+/gi,
  pan: /[A-Z]{5}[0-9]{4}[A-Z]/g,
  aadhaar: /\b\d{4}\s\d{4}\s\d{4}\b/g,
  cryptoAddresses: /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b|0x[a-fA-F0-9]{40}/g,
  namesOrganizations: /(?:from|calling from|I am from|this is)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*(?:\s(?:Bank|Insurance|Department|Ministry|Office|Ltd))?)/g
};

export function extractIntelligence(text = '') {
  const result = {};

  for (const [key, pattern] of Object.entries(PATTERNS)) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      result[key] = [...new Set(matches.map((m) => m[0]))];
    }
  }

  return result;
}

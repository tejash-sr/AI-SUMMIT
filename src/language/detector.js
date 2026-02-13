const LANGUAGE_SIGNATURES = {
  hindi_devanagari: /[\u0900-\u097F]/,
  tamil: /[\u0B80-\u0BFF]/,
  telugu: /[\u0C00-\u0C7F]/,
  kannada: /[\u0C80-\u0CFF]/,
  bengali: /[\u0980-\u09FF]/,
  marathi: /[\u0900-\u097F]/,
  gujarati: /[\u0A80-\u0AFF]/,
  punjabi: /[\u0A00-\u0A7F]/,
  hinglish_markers: ['aapka', 'karein', 'abhi', 'karo', 'bank', 'account', 'kyc', 'otp'],
  english_only: /^[a-zA-Z0-9\s\.,!?'"()-]+$/
};

export function detectLanguage(text = '') {
  const result = {
    primaryScript: 'english',
    languages: [],
    isMixed: false,
    responseGuidance: ''
  };

  if (LANGUAGE_SIGNATURES.tamil.test(text)) {
    result.primaryScript = 'tamil';
    result.languages.push('Tamil');
  } else if (LANGUAGE_SIGNATURES.telugu.test(text)) {
    result.primaryScript = 'telugu';
    result.languages.push('Telugu');
  } else if (LANGUAGE_SIGNATURES.bengali.test(text)) {
    result.primaryScript = 'bengali';
    result.languages.push('Bengali');
  } else if (LANGUAGE_SIGNATURES.gujarati.test(text)) {
    result.primaryScript = 'gujarati';
    result.languages.push('Gujarati');
  } else if (LANGUAGE_SIGNATURES.hindi_devanagari.test(text)) {
    result.primaryScript = 'hindi_devanagari';
    result.languages.push('Hindi');
  } else {
    const lower = text.toLowerCase();
    const markerHits = LANGUAGE_SIGNATURES.hinglish_markers.filter((m) => lower.includes(m));
    if (markerHits.length >= 2) {
      result.primaryScript = 'hinglish';
      result.languages.push('Hinglish');
    }
  }

  const hasLatin = /[a-zA-Z]{3,}/.test(text);
  const hasIndic = Object.values(LANGUAGE_SIGNATURES)
    .filter((v) => v instanceof RegExp)
    .some((regex) => regex.test(text));

  if (hasLatin && hasIndic) {
    result.isMixed = true;
    if (!result.languages.includes('English')) {
      result.languages.push('English');
    }
  }

  if (result.isMixed) {
    result.responseGuidance = `Respond in mixed ${result.languages.join('+')} (Hinglish style). Mirror the ratio of scripts used by scammer.`;
  } else if (result.primaryScript === 'english') {
    result.responseGuidance = 'Respond in Indian English with occasional Hindi filler words.';
  } else {
    result.responseGuidance = `Respond ONLY in ${result.languages[0] || result.primaryScript}. Use appropriate script. Do not switch to English.`;
  }

  return result;
}

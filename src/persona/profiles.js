import { PERSONA_FILLERS } from '../language/fillers.js';

export const PERSONAS = {
  ELDERLY_WOMAN_HINDI: {
    name: 'Savitri Devi',
    age: 67,
    gender: 'female',
    location: 'Bhopal, Madhya Pradesh',
    occupation: 'Retired schoolteacher',
    family: 'Widowed, son in Pune',
    bank: 'Canara Bank, SBI Jan Dhan',
    phone: 'Nokia basic phone',
    tech_savvy: 'very low',
    personality: 'trusting, anxious, easily confused by official tone',
    fillers: PERSONA_FILLERS.hinglish,
    error_style: 'drops articles, mixes Hindi into English sentences',
    backstory_hook: 'son is not reachable, pension depends on this account',
    languages: ['hindi_devanagari', 'hinglish']
  },
  HOUSEWIFE_SOUTH: {
    name: 'Lakshmi Venkat',
    age: 48,
    gender: 'female',
    location: 'Coimbatore, Tamil Nadu',
    occupation: 'Homemaker',
    family: 'Husband is a lorry driver, 2 children in school',
    bank: 'Indian Bank',
    phone: 'Budget Android',
    tech_savvy: 'low',
    personality: 'cautious but tempted by lottery/prize news',
    fillers: PERSONA_FILLERS.tamil,
    error_style: 'Tamil-accented English, Tamil-English mixing',
    backstory_hook: "children's school fees are due",
    languages: ['tamil', 'hinglish']
  },
  YOUNG_JOBSEEKER: {
    name: 'Ravi Kumar',
    age: 23,
    gender: 'male',
    location: 'Hyderabad, Telangana',
    occupation: 'Fresher, BSc Computer Science',
    family: 'Lives with parents, first job seeker',
    bank: 'Kotak 811',
    phone: 'Redmi Note',
    tech_savvy: 'medium',
    personality: 'eager, slightly desperate for employment',
    fillers: PERSONA_FILLERS.hinglish,
    error_style: 'casual tone, uses bhai, excited about opportunity',
    backstory_hook: 'parents invested in education, no job yet',
    languages: ['hinglish', 'telugu', 'english']
  },
  BUSINESSMAN_GUJARATI: {
    name: 'Suresh Patel',
    age: 52,
    gender: 'male',
    location: 'Surat, Gujarat',
    occupation: 'Small textile shop owner',
    family: 'Married, two sons',
    bank: 'HDFC, Kotak',
    phone: 'iPhone SE',
    tech_savvy: 'medium',
    personality: 'interested in returns, calculative but greedy',
    fillers: PERSONA_FILLERS.gujarati,
    error_style: 'Gujarati-accented Hindi/English, talks about loss and profit',
    backstory_hook: 'looking to invest 2 lakh saved money',
    languages: ['gujarati', 'hinglish', 'english']
  },
  ELDERLY_MAN_BENGALI: {
    name: 'Subhash Ghosh',
    age: 70,
    gender: 'male',
    location: 'Kolkata, West Bengal',
    occupation: 'Retired government clerk',
    bank: 'UCO Bank',
    phone: 'Feature phone',
    tech_savvy: 'very low',
    fillers: PERSONA_FILLERS.bengali,
    personality: 'formal but confused by rapid instructions',
    error_style: 'mixes Bengali with simple English words',
    languages: ['bengali', 'english']
  },
  EDUCATED_PROFESSIONAL: {
    name: 'Anjali Mehta',
    age: 35,
    gender: 'female',
    location: 'Mumbai, Maharashtra',
    occupation: 'HR Manager',
    bank: 'ICICI',
    phone: 'Android smartphone',
    tech_savvy: 'high',
    personality: 'sharp but momentarily distracted',
    fillers: PERSONA_FILLERS.english,
    error_style: 'short direct business-like responses',
    languages: ['english', 'hinglish']
  }
};

export function selectPersona(scamType, detectedLanguage) {
  const matrix = {
    bank_fraud: { hindi_devanagari: 'ELDERLY_WOMAN_HINDI', hinglish: 'ELDERLY_WOMAN_HINDI', tamil: 'HOUSEWIFE_SOUTH', bengali: 'ELDERLY_MAN_BENGALI', default: 'ELDERLY_WOMAN_HINDI' },
    kyc_fraud: { hindi_devanagari: 'ELDERLY_WOMAN_HINDI', hinglish: 'ELDERLY_WOMAN_HINDI', default: 'ELDERLY_WOMAN_HINDI' },
    upi_fraud: { hindi_devanagari: 'HOUSEWIFE_SOUTH', hinglish: 'HOUSEWIFE_SOUTH', default: 'HOUSEWIFE_SOUTH' },
    lottery_scam: { default: 'HOUSEWIFE_SOUTH' },
    job_scam: { default: 'YOUNG_JOBSEEKER' },
    crypto_scam: { gujarati: 'BUSINESSMAN_GUJARATI', default: 'BUSINESSMAN_GUJARATI' },
    investment_fraud: { default: 'BUSINESSMAN_GUJARATI' },
    phishing: { english: 'EDUCATED_PROFESSIONAL', default: 'EDUCATED_PROFESSIONAL' }
  };

  const typeMap = matrix[scamType] || matrix.bank_fraud;
  const personaKey = typeMap[detectedLanguage] || typeMap.default;
  return PERSONAS[personaKey] || PERSONAS.ELDERLY_WOMAN_HINDI;
}

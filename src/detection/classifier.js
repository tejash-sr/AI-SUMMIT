const SCAM_PATTERNS = {
  bank_fraud: {
    patterns: [/account.*block/i, /kyc.*expire/i, /verify.*bank/i, /sbi|hdfc|icici|canara/i, /account.*suspend/i],
    hindi_patterns: [/खाता.*बंद/i, /केवाईसी/i, /बैंक.*वेरीफाई/i, /अकाउंट.*ब्लॉक/i],
    tamil_patterns: [/கணக்கு.*தடை/i, /வங்கி.*சரிபார்/i],
    tactics: ['authority', 'urgency', 'fear'],
    weight: 3
  },
  upi_fraud: {
    patterns: [/upi|paytm|gpay|phonepe/i, /share.*upi/i, /send.*money/i, /receive.*payment/i, /qr.*scan/i],
    hindi_patterns: [/यूपीआई|पेटीएम/i, /पैसे.*भेजो/i],
    tactics: ['urgency', 'financial_request', 'upi_request'],
    weight: 3
  },
  otp_fraud: {
    patterns: [/otp|one.time.password/i, /share.*otp/i, /verify.*otp/i],
    hindi_patterns: [/ओटीपी.*बताओ/i, /ओटीपी.*शेयर/i],
    tactics: ['otp_request', 'urgency'],
    weight: 4
  },
  lottery_scam: {
    patterns: [/won|winner|prize|lottery|reward/i, /claim.*prize/i, /lucky.*draw/i],
    hindi_patterns: [/इनाम|लॉटरी|जीत/i],
    tactics: ['greed', 'urgency'],
    weight: 2
  },
  job_scam: {
    patterns: [/job.*offer|hiring|vacancy|salary/i, /work.*from.*home/i, /earn.*per.*day/i],
    tactics: ['greed', 'hope'],
    weight: 2
  },
  phishing: {
    patterns: [/click.*link|http|bit\.ly|tinyurl/i, /verify.*account.*link/i],
    tactics: ['phishing_url'],
    weight: 3
  },
  investment_fraud: {
    patterns: [/invest|return|profit|double.*money|crypto|bitcoin/i, /guaranteed.*return/i],
    tactics: ['greed', 'financial_request'],
    weight: 2
  }
};

export function classifyScam(text, history = []) {
  const fullContext = `${text} ${history.map((h) => h.text || '').join(' ')}`;
  let bestMatch = { type: 'generic_scam', confidence: 0.5, tactics: ['urgency'], isScam: true };
  let highestScore = 0;

  for (const [type, config] of Object.entries(SCAM_PATTERNS)) {
    let score = 0;
    const allPatterns = [...(config.patterns || []), ...(config.hindi_patterns || []), ...(config.tamil_patterns || [])];

    allPatterns.forEach((pattern) => {
      if (pattern.test(fullContext)) score += config.weight;
    });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = {
        type,
        confidence: Math.min(0.5 + score * 0.1, 0.99),
        tactics: [...config.tactics],
        isScam: score > 0
      };
    }
  }

  const urgencyWords = /urgent|immediately|now|abhi|turant|jaldi|अभी|तुरंत|जल्दी/i;
  if (urgencyWords.test(text)) {
    bestMatch.confidence = Math.min(bestMatch.confidence + 0.1, 0.99);
    if (!bestMatch.tactics.includes('urgency')) bestMatch.tactics.push('urgency');
  }

  return bestMatch;
}

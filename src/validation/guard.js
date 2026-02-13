const AI_TELLS = [
  /^(certainly|absolutely|of course|sure|indeed|I understand|I apologize|As an AI)/i,
  /I('m| am) here to help/i,
  /I('d| would) be happy to/i,
  /feel free to/i,
  /let me know if/i,
  /how can I assist/i
];

const TOO_FORMAL = [
  /furthermore|moreover|additionally|in conclusion/i,
  /it is important to note/i,
  /please be advised/i
];

export function validateResponse(reply, persona, languageResult) {
  let safeReply = reply || '';

  for (const pattern of [...AI_TELLS, ...TOO_FORMAL]) {
    if (pattern.test(safeReply)) {
      safeReply = getPersonaFallback(persona, languageResult);
      break;
    }
  }

  if (safeReply.length > 250) {
    safeReply = `${safeReply.split(/[.!?।]/)[0]}?`;
  }

  if (!/[?।!]$/.test(safeReply.trim())) {
    safeReply = `${safeReply.trim()}...`;
  }

  return safeReply;
}

function getPersonaFallback(persona, languageResult) {
  const fallbacks = {
    hindi_devanagari: 'अरे, मुझे समझ नहीं आया... आप फिर से बता सकते हैं?',
    hinglish: 'Arrey, main samajh nahi paya... kya aap phir se bol sakte hain?',
    tamil: 'ஐயோ, எனக்கு புரியவில்லை... மீண்டும் சொல்ல முடியுமா?',
    telugu: 'అయ్యో, నాకు అర్థం కాలేదు... మళ్ళీ చెప్పగలరా?',
    bengali: 'আরে, আমি বুঝতে পারিনি... আবার বলবেন?',
    english: "Oh wait, I didn't quite catch that... can you repeat please?"
  };

  return fallbacks[languageResult?.primaryScript] || fallbacks.hinglish;
}

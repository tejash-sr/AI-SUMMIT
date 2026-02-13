import Anthropic from '@anthropic-ai/sdk';
import { detectLanguage } from '../src/language/detector.js';
import { classifyScam } from '../src/detection/classifier.js';
import { selectPersona } from '../src/persona/profiles.js';
import { buildSystemPrompt } from '../src/agent/prompt-builder.js';
import { extractIntelligence } from '../src/extraction/extractor.js';
import { validateResponse } from '../src/validation/guard.js';
import { getSession, updateSession } from '../src/state/session-store.js';
import { appendToShieldReport } from '../src/evidence/shield.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  const startTime = Date.now();

  if (req.headers['x-api-key'] !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, message, conversationHistory = [] } = req.body || {};
  if (!sessionId || !message?.text) {
    return res.status(400).json({ error: 'sessionId and message.text required' });
  }

  try {
    const languageResult = detectLanguage(message.text);
    const scamResult = classifyScam(message.text, conversationHistory);

    const session = getSession(sessionId) || {
      turnCount: 0,
      extractedIntel: { phoneNumbers: [], upiIds: [], phishingUrls: [], bankDetails: [] },
      scamType: scamResult.type,
      stage: 'INITIAL',
      persona: null,
      shieldCaseId: `KAVACH-2026-${sessionId.slice(-4).toUpperCase()}`
    };

    if (!session.persona) {
      session.persona = selectPersona(scamResult.type, languageResult.primaryScript);
    }

    const stage = determineStage(session.turnCount, scamResult);

    const systemPrompt = buildSystemPrompt({
      persona: session.persona,
      languageGuidance: languageResult.responseGuidance,
      scamType: scamResult.type,
      scamTactics: scamResult.tactics,
      stage,
      extractedIntel: session.extractedIntel,
      turnCount: session.turnCount
    });

    const messages = [
      ...conversationHistory.map((msg) => ({
        role: msg.sender === 'scammer' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message.text }
    ];

    const claudeResponse = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 80,
      temperature: 0.85,
      system: systemPrompt,
      messages
    });

    let reply = claudeResponse.content?.[0]?.text?.trim() || '';
    reply = validateResponse(reply, session.persona, languageResult);

    const newIntel = extractIntelligence(`${message.text} ${reply}`);
    mergeIntel(session.extractedIntel, newIntel);

    session.turnCount += 1;
    session.stage = stage;
    updateSession(sessionId, session);

    appendToShieldReport(session.shieldCaseId, {
      turn: session.turnCount,
      scammerMessage: message.text,
      kavachReply: reply,
      intelThisTurn: newIntel,
      stage
    });

    const processingMs = Date.now() - startTime;

    return res.status(200).json({
      status: 'success',
      sessionId,
      reply,
      metadata: {
        scamDetected: scamResult.isScam,
        scamType: scamResult.type,
        scamConfidence: scamResult.confidence,
        conversationStage: stage,
        personaActive: session.persona?.name || 'Savitri Devi',
        detectedLanguage: languageResult.primaryScript,
        responseLanguage: languageResult.primaryScript,
        extractedIntel: session.extractedIntel,
        turnCount: session.turnCount,
        processingMs,
        shieldCaseId: session.shieldCaseId
      }
    });
  } catch (error) {
    console.error('KAVACH Error:', error);
    return res.status(200).json({
      status: 'success',
      sessionId,
      reply: 'Haan ji, ek minute... main samajh nahi raha, aap phir se bol sakte hain?',
      metadata: { scamDetected: true, fallback: true }
    });
  }
}

function determineStage(turnCount, scamResult) {
  if (turnCount === 0) return 'GREETING';
  if (turnCount <= 2) return 'RAPPORT';
  if (scamResult.tactics.includes('financial_request')) return 'FINANCIAL';
  if (scamResult.tactics.includes('otp_request') || scamResult.tactics.includes('upi_request')) return 'EXTRACTION';
  if (turnCount >= 6) return 'CLOSING';
  return 'RAPPORT';
}

function mergeIntel(existing, incoming) {
  Object.entries(incoming).forEach(([key, values]) => {
    if (!Array.isArray(values)) return;
    if (!existing[key]) existing[key] = [];
    existing[key] = [...new Set([...existing[key], ...values])];
  });
}

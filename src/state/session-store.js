const sessions = new Map();

export function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

export function updateSession(sessionId, session) {
  sessions.set(sessionId, session);
}

export function clearSessions() {
  sessions.clear();
}

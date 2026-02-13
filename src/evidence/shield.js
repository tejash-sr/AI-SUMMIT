const shieldReports = new Map();

export function appendToShieldReport(caseId, turnData) {
  if (!shieldReports.has(caseId)) {
    shieldReports.set(caseId, {
      caseId,
      generatedAt: new Date().toISOString(),
      status: 'ACTIVE',
      scamType: null,
      totalTurns: 0,
      conversationTranscript: [],
      cumulativeIntel: {
        phoneNumbers: new Set(),
        upiIds: new Set(),
        phishingUrls: new Set(),
        bankDetails: new Set(),
        namesFound: new Set(),
        organizationsClaimed: new Set()
      },
      lawEnforcementSummary: ''
    });
  }

  const report = shieldReports.get(caseId);
  report.totalTurns = turnData.turn;
  report.conversationTranscript.push({
    turn: turnData.turn,
    timestamp: new Date().toISOString(),
    scammer: turnData.scammerMessage,
    kavach_agent: turnData.kavachReply,
    stage: turnData.stage,
    intelExtracted: turnData.intelThisTurn
  });

  Object.keys(turnData.intelThisTurn || {}).forEach((key) => {
    if (report.cumulativeIntel[key] && Array.isArray(turnData.intelThisTurn[key])) {
      turnData.intelThisTurn[key].forEach((item) => report.cumulativeIntel[key].add(item));
    }
  });

  report.lawEnforcementSummary = generateLESummary(report);
}

export function getShieldReport(caseId) {
  const report = shieldReports.get(caseId);
  if (!report) return null;

  return {
    ...report,
    cumulativeIntel: Object.fromEntries(Object.entries(report.cumulativeIntel).map(([k, v]) => [k, [...v]])),
    generatedBy: 'KAVACH AI Honeypot System v1.0',
    disclaimer: 'Evidence collected by autonomous AI honeypot. Admissible as digital evidence under IT Act 2000.',
    cybercellNote: 'Report this evidence at: cybercrime.gov.in | Helpline: 1930'
  };
}

function generateLESummary(report) {
  const intel = report.cumulativeIntel;
  const lines = [`KAVACH SHIELD REPORT — Case ID: ${report.caseId}`];
  lines.push(`Scam Type: ${report.scamType || 'Under investigation'}`);
  lines.push(`Duration: ${report.totalTurns} conversation turns`);
  if ([...intel.phoneNumbers].length) lines.push(`Scammer Phone(s): ${[...intel.phoneNumbers].join(', ')}`);
  if ([...intel.upiIds].length) lines.push(`UPI IDs Exposed: ${[...intel.upiIds].join(', ')}`);
  if ([...intel.phishingUrls].length) lines.push(`Phishing URLs: ${[...intel.phishingUrls].join(', ')}`);
  if ([...intel.bankDetails].length) lines.push(`Bank Details: ${[...intel.bankDetails].join(', ')}`);
  lines.push(`Recommended Action: File FIR at nearest Cyber Crime Cell. Evidence ID: ${report.caseId}`);
  return lines.join('\n');
}

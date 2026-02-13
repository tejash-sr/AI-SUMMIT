import assert from 'node:assert/strict';
import fs from 'node:fs';
import { classifyScam } from '../src/detection/classifier.js';
import { detectLanguage } from '../src/language/detector.js';
import { extractIntelligence } from '../src/extraction/extractor.js';

const testCases = JSON.parse(fs.readFileSync(new URL('./test-cases.json', import.meta.url), 'utf8'));

for (const tc of testCases) {
  const cls = classifyScam(tc.text);
  const lang = detectLanguage(tc.text);
  if (tc.expect.type) {
    assert.equal(cls.type, tc.expect.type, `${tc.name}: expected type ${tc.expect.type}, got ${cls.type}`);
  }
  if (tc.expect.language) {
    assert.equal(lang.primaryScript, tc.expect.language, `${tc.name}: expected language ${tc.expect.language}, got ${lang.primaryScript}`);
  }
}

const intel = extractIntelligence('Call me +919876543210 and send to abc@oksbi https://tinyurl.com/xxyy');
assert.ok(intel.phoneNumbers?.length, 'phone extraction failed');
assert.ok(intel.upiIds?.length, 'upi extraction failed');
assert.ok(intel.phishingUrls?.length, 'url extraction failed');

console.log('All tests passed');

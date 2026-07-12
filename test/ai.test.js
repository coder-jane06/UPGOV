import { describe, it, expect } from 'vitest';
import { parseClaudeJson } from '../src/ai.js';
import { SLA_WINDOWS } from '../src/data.js';

describe('AI JSON Parsing', () => {
  it('extracts JSON correctly from markdown blocks', () => {
    const rawOutput = `Here is your output:
\`\`\`json
{
  "category": "Roads & Potholes",
  "priority": "High"
}
\`\`\``;
    const parsed = parseClaudeJson(rawOutput);
    expect(parsed.category).toBe("Roads & Potholes");
    expect(parsed.priority).toBe("High");
  });

  it('handles JSON with trailing text', () => {
    const rawOutput = `{ "status": "ok" } and some trailing text`;
    const parsed = parseClaudeJson(rawOutput);
    expect(parsed.status).toBe("ok");
  });
  
  it('returns fallback object on completely invalid input', () => {
    const rawOutput = `This is just some text without JSON`;
    const parsed = parseClaudeJson(rawOutput);
    expect(parsed).toEqual({});
  });
});

describe('SLA Windows Math', () => {
  it('returns correct SLA for known categories', () => {
    expect(SLA_WINDOWS['Roads & Potholes']).toBe(4);
    expect(SLA_WINDOWS['Water Supply']).toBe(3);
    expect(SLA_WINDOWS['Electricity']).toBe(2);
  });

  it('returns default SLA for unknown category', () => {
    expect(SLA_WINDOWS['default']).toBe(4);
  });
});

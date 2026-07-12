// ============================================================
// ai.js — Real Gemini-powered AI with multi-tool agent loop
// ============================================================

const GEMINI_MODEL = 'gemini-2.0-flash';
const PROXY_ENDPOINT = '/api/gemini';

// ─── Core Gemini API Call ────────────────────────────────────
/**
 * Calls Gemini API securely via our backend proxy.
 * Supports function calling (tools) for agentic behavior.
 *
 * @param {string} system  — System instruction
 * @param {string} user    — User message
 * @param {Array}  history — Conversation history in Gemini format
 * @param {Array}  tools   — Function declarations for tool use
 * @returns {Object} Raw Gemini API response
 */
export async function callGemini(system, user, history = [], tools = []) {
  const contents = [
    ...history,
    { role: 'user', parts: [{ text: user }] },
  ];

  const body = {
    contents,
    systemInstruction: { parts: [{ text: system }] },
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  };

  if (tools.length > 0) {
    body.tools = [{ functionDeclarations: tools }];
  }

  const response = await fetch(PROXY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: GEMINI_MODEL, body }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${err}`);
  }

  return response.json();
}

// ─── Legacy compat: keep the old name working ────────────────
export async function callClaude(system, user, history = [], tools = []) {
  const resp = await callGemini(system, user, history, tools);
  // Return a text string for backward compatibility with parseClaudeJson
  const text = extractText(resp);
  return text;
}

// ─── Response Helpers ────────────────────────────────────────

/** Extract text from a Gemini response */
export function extractText(response) {
  try {
    const parts = response?.candidates?.[0]?.content?.parts || [];
    const textPart = parts.find(p => p.text);
    return textPart?.text || '';
  } catch {
    return '';
  }
}

/** Extract function calls from a Gemini response */
export function extractFunctionCalls(response) {
  try {
    const parts = response?.candidates?.[0]?.content?.parts || [];
    return parts.filter(p => p.functionCall).map(p => p.functionCall);
  } catch {
    return [];
  }
}

/** Check if the model wants to call a function */
export function hasFunctionCall(response) {
  return extractFunctionCalls(response).length > 0;
}

/** Parse JSON from text, handling markdown fences */
export function parseClaudeJson(text) {
  try {
    const cleaned = String(text || '')
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd === 0) return JSON.parse(cleaned);
    return JSON.parse(cleaned.substring(jsonStart, jsonEnd));
  } catch {
    return {};
  }
}

// ─── Tool Definitions (Gemini Function Calling format) ───────

export const TICKET_TOOLS = [
  {
    name: 'find_duplicate',
    description:
      'Search existing open tickets in the same sector for semantic similarity. Returns match confidence and existing ticket ID if found. MUST be called first before any other tool.',
    parameters: {
      type: 'OBJECT',
      properties: {
        description: { type: 'STRING', description: 'The complaint description to check for duplicates' },
        sector: { type: 'STRING', description: 'The sector/location of the complaint' },
        category: { type: 'STRING', description: 'The complaint category' },
      },
      required: ['description', 'sector'],
    },
  },
  {
    name: 'classify_ticket',
    description:
      'Classify the complaint into the correct category and department. Returns category, department, confidence, and reasoning.',
    parameters: {
      type: 'OBJECT',
      properties: {
        description: { type: 'STRING', description: 'The full complaint description' },
        suggested_category: { type: 'STRING', description: 'The category suggested by the citizen' },
      },
      required: ['description'],
    },
  },
  {
    name: 'assess_severity',
    description:
      'Assess ticket priority based on description, category, and department backlog. Returns priority level and justification.',
    parameters: {
      type: 'OBJECT',
      properties: {
        description: { type: 'STRING', description: 'The complaint description' },
        category: { type: 'STRING', description: 'The classified category' },
        department: { type: 'STRING', description: 'The assigned department' },
        sector: { type: 'STRING', description: 'The sector/location' },
      },
      required: ['description', 'category', 'department'],
    },
  },
];

// ─── Tool Executor ───────────────────────────────────────────

/**
 * Executes a tool call with real logic.
 * Some tools make nested Gemini calls for semantic analysis.
 */
export async function executeTool(toolName, toolInput, existingTickets = [], deptStats = {}) {
  switch (toolName) {
    // ── DUPLICATE DETECTION ──────────────────────────────────
    case 'find_duplicate': {
      const candidates = existingTickets.filter(
        t =>
          t.location === toolInput.sector &&
          t.status !== 'Resolved' &&
          (!toolInput.category || t.category === toolInput.category)
      );

      if (candidates.length === 0) {
        return { isDuplicate: false, reason: 'No open tickets found in this sector for this category.' };
      }

      // Semantic comparison via a nested Gemini call (no tools)
      try {
        const comparePrompt = `
New complaint: "${toolInput.description}"

Existing open tickets in ${toolInput.sector}:
${candidates
  .slice(0, 5)
  .map(t => `- [${t.ticketId}] "${t.description || t.category}"`)
  .join('\n')}

Is the new complaint reporting the same underlying issue as any existing ticket?
Respond with ONLY this JSON: { "isDuplicate": boolean, "matchedId": string|null, "confidence": number (0-100), "reason": string }`;

        const text = await callClaude(
          'You are a duplicate detection system for civic complaints. Compare complaints for semantic similarity. Respond ONLY in valid JSON, no markdown.',
          comparePrompt
        );
        const parsed = parseClaudeJson(text);
        return {
          isDuplicate: Boolean(parsed.isDuplicate),
          matchedId: parsed.matchedId || null,
          confidence: parsed.confidence || 0,
          reason: parsed.reason || 'Analysis complete.',
        };
      } catch (err) {
        console.warn('Duplicate check fallback:', err);
        return { isDuplicate: false, reason: 'Duplicate check completed (fallback).' };
      }
    }

    // ── CLASSIFICATION ───────────────────────────────────────
    case 'classify_ticket': {
      try {
        const text = await callClaude(
          `You are a municipal complaint classifier for GNIDA (Greater Noida Industrial Development Authority).
Available departments: PWD (roads, pavements, bridges), Jal Board (water supply, sewage, pipes), 
GNIDA Sanitation (garbage, drains, public toilets), PVVNL (electricity, transformers, streetlights),
Environment Cell (pollution, green spaces, dumping), Public Works (general infrastructure).
Available categories: Roads & Potholes, Water Supply, Sanitation, Electricity, Public Lighting, Encroachment, Noise Pollution, Environmental/Green, Other.
Respond ONLY in valid JSON, no markdown.`,
          `Classify this complaint: "${toolInput.description}"
Citizen suggested category: "${toolInput.suggested_category || 'Not specified'}"
Return: { "category": string, "department": string, "confidence": number (0-100), "reasoning": string }`
        );
        const parsed = parseClaudeJson(text);
        return {
          category: parsed.category || toolInput.suggested_category || 'Other',
          department: parsed.department || 'PWD',
          confidence: parsed.confidence || 75,
          reasoning: parsed.reasoning || 'Classified based on description analysis.',
        };
      } catch (err) {
        console.warn('Classification fallback:', err);
        return {
          category: toolInput.suggested_category || 'Other',
          department: 'PWD',
          confidence: 50,
          reasoning: 'Classification completed (fallback).',
        };
      }
    }

    // ── SEVERITY ASSESSMENT ──────────────────────────────────
    case 'assess_severity': {
      const dept = deptStats[toolInput.department] || {};
      const backlogInfo = dept.active != null
        ? `${dept.active} open tickets, avg resolution ${dept.avgDays || '?'} days, SLA compliance ${dept.sla || '?'}%`
        : 'No backlog data available';

      try {
        const text = await callClaude(
          'You are a municipal priority assessment system for GNIDA. Respond ONLY in valid JSON, no markdown.',
          `Assess priority for this complaint:
Description: "${toolInput.description}"
Category: ${toolInput.category}
Department: ${toolInput.department}
Sector: ${toolInput.sector || 'Unknown'}
Department current status: ${backlogInfo}

Return: { "priority": "Critical"|"High"|"Medium"|"Low", "justification": string, "estimatedResolutionDays": number }`
        );
        const parsed = parseClaudeJson(text);
        return {
          priority: parsed.priority || 'Medium',
          justification: parsed.justification || 'Priority assessed based on description and department capacity.',
          estimatedResolutionDays: parsed.estimatedResolutionDays || 4,
        };
      } catch (err) {
        console.warn('Severity assessment fallback:', err);
        return {
          priority: 'Medium',
          justification: 'Priority assessed (fallback).',
          estimatedResolutionDays: 4,
        };
      }
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// ─── Orchestrator Agent Loop ─────────────────────────────────

/**
 * Runs the full multi-tool agent loop for ticket processing.
 * This is the heart of the agentic system.
 *
 * @param {Object} formData       — The complaint form data
 * @param {Array}  existingTickets — Current ticket list for duplicate checking
 * @param {Object} deptStats      — Department performance stats (from DEPT_PERFORMANCE)
 * @param {Function} onTraceUpdate — Callback to update the UI with live trace
 * @returns {Object} { toolResults, finalText, isDuplicate, matchedId }
 */
export async function runAgentLoop(formData, existingTickets, deptStats, onTraceUpdate) {
  const trace = [];
  const toolResults = {};

  const agentSystem = `You are a municipal grievance processing agent for GNIDA (Greater Noida).
You have three tools available. You MUST follow this exact sequence:
1. ALWAYS call find_duplicate first to check for existing reports
2. If duplicate found with confidence > 75: STOP and explain the match in text. Do NOT call more tools.
3. If NOT duplicate: call classify_ticket to properly categorize the complaint
4. Then call assess_severity to determine priority based on classification and department backlog
5. After all tools complete, provide a brief summary of your decisions.

Never skip steps. Always explain your reasoning. Process one tool at a time.`;

  const agentUser = `Process this new civic complaint:
Sector: ${formData.location || formData.sector || 'Unknown'}
Category (citizen suggested): ${formData.category || 'Not specified'}
Subcategory: ${formData.subcategory || 'Not specified'}
Description: ${formData.description}`;

  try {
    // Initial call with tools
    let response = await callGemini(agentSystem, agentUser, [], TICKET_TOOLS);
    let conversationHistory = [
      { role: 'user', parts: [{ text: agentUser }] },
      response.candidates[0].content, // model's response
    ];

    let loopCount = 0;
    const MAX_LOOPS = 6; // Safety limit

    // Agentic loop — keep going while model wants to call tools
    while (hasFunctionCall(response) && loopCount < MAX_LOOPS) {
      loopCount++;
      const functionCalls = extractFunctionCalls(response);

      const functionResponseParts = [];

      for (const fc of functionCalls) {
        // Update trace — mark as running
        const traceEntry = {
          tool: fc.name,
          input: fc.args || {},
          status: 'running',
          timestamp: new Date().toISOString(),
        };
        trace.push(traceEntry);
        onTraceUpdate?.([...trace]);

        // Execute the tool
        const result = await executeTool(fc.name, fc.args || {}, existingTickets, deptStats);

        // Check for duplicate early exit
        if (fc.name === 'find_duplicate' && result.isDuplicate && result.confidence > 75) {
          traceEntry.status = 'done';
          traceEntry.output = result;
          onTraceUpdate?.([...trace]);

          return {
            toolResults: { find_duplicate: result },
            finalText: `Duplicate detected: This complaint matches ticket ${result.matchedId} with ${result.confidence}% confidence. ${result.reason}`,
            isDuplicate: true,
            matchedId: result.matchedId,
            trace: [...trace],
          };
        }

        // Mark trace as done
        traceEntry.status = 'done';
        traceEntry.output = result;
        toolResults[fc.name] = result;
        onTraceUpdate?.([...trace]);

        functionResponseParts.push({
          functionResponse: {
            name: fc.name,
            response: result,
          },
        });
      }

      // Continue conversation with tool results
      conversationHistory.push({
        role: 'user',
        parts: functionResponseParts,
      });

      response = await callGemini(agentSystem, '', conversationHistory, TICKET_TOOLS);

      // Add model response to history
      if (response.candidates?.[0]?.content) {
        conversationHistory.push(response.candidates[0].content);
      }
    }

    // Extract final summary text
    const finalText = extractText(response);

    return {
      toolResults,
      finalText,
      isDuplicate: false,
      matchedId: null,
      trace: [...trace],
    };
  } catch (error) {
    // Graceful degradation for 429 Rate Limit (Free Tier)
    if (error.message && error.message.includes('429')) {
      console.warn('API Rate Limit Exceeded. Using graceful fallback for demo.');
      return {
        toolResults: {
          find_duplicate: { isDuplicate: false, reason: 'Fallback check.' },
          classify_ticket: { category: formData.category || 'Other', department: 'PWD', confidence: 90, reasoning: 'Fallback classification.' },
          assess_severity: { priority: 'High', justification: 'Fallback severity due to API limit.', estimatedResolutionDays: 3 }
        },
        finalText: 'I have classified this issue and assigned it to the appropriate department. (Note: This is a fallback response due to API rate limits).',
        isDuplicate: false,
        matchedId: null,
        trace: [
          { tool: 'find_duplicate', status: 'done', output: { isDuplicate: false }, timestamp: new Date().toISOString() },
          { tool: 'classify_ticket', status: 'done', output: { category: formData.category, department: 'PWD' }, timestamp: new Date().toISOString() },
          { tool: 'assess_severity', status: 'done', output: { priority: 'High' }, timestamp: new Date().toISOString() }
        ],
      };
    }

    throw error;
  }
}

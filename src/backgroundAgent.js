import { callGemini, extractText, parseClaudeJson } from './ai';
import { getInitialTickets, saveTickets } from './data';

const SLA_WINDOWS = {
  'Electricity': 1,
  'Roads & Potholes': 3,
  'Water Supply': 2,
  'Sanitation': 2,
  'Public Lighting': 3,
  'Encroachment': 5,
  'Noise Pollution': 2,
  'Environmental/Green': 3,
  'default': 5
};

/**
 * Runs the autonomous SLA monitor.
 * Scans open tickets, identifies those near breach, and uses the agent to evaluate escalation.
 * 
 * @param {Function} onEscalation Callback fired when an escalation event occurs
 */
export async function runSLAMonitor(onEscalation) {
  try {
    const allTickets = getInitialTickets();
    
    // Find open, un-merged tickets
    const openTickets = allTickets.filter(t => 
      !['Resolved', 'SLA Breached'].includes(t.status) && 
      !t.isDuplicate
    );
    
    if (!openTickets.length) return;
    
    const now = new Date();
    
    // Find tickets nearing or past SLA breach (within 6 hours)
    const atRiskTickets = openTickets.filter(ticket => {
      const filedAt = ticket.filedAt || ticket.filed || ticket.date;
      const start = new Date(filedAt).getTime();
      const days = SLA_WINDOWS[ticket.category] || SLA_WINDOWS.default;
      const end = start + (days * 24 * 60 * 60 * 1000);
      
      const hoursRemaining = (end - now.getTime()) / (1000 * 60 * 60);
      return hoursRemaining < 6; // Under 6 hours: agent must decide
    });
    
    if (!atRiskTickets.length) return;
    
    // Ask the agent to reason about escalations
    const agentPrompt = `These tickets are approaching or past SLA breach. Decide which to escalate:
${JSON.stringify(atRiskTickets.map(t => {
  const start = new Date(t.filedAt || t.filed || t.date).getTime();
  const days = SLA_WINDOWS[t.category] || SLA_WINDOWS.default;
  const hoursRemaining = ((start + (days * 24 * 60 * 60 * 1000)) - now.getTime()) / 3600000;
  
  return {
    id: t.ticketId,
    category: t.category,
    department: t.department,
    sector: t.location || t.sector,
    priority: t.priority,
    hoursRemaining: hoursRemaining.toFixed(1),
    status: t.status
  };
}))}

Return ONLY valid JSON in this format:
{ 
  "escalations": [
    { "ticketId": "GN-123456", "reason": "Detailed reason for escalation", "urgency": "Immediate"|"High" }
  ]
}`;

    const response = await callGemini(
      `You are an autonomous SLA monitoring agent for GNIDA municipal services.
Your job is to decide which tickets require immediate escalation to prevent SLA breach.
Consider: time remaining, issue severity, citizen impact, and department capacity.
Be selective — only escalate genuinely urgent cases. If none are urgent enough, return an empty array.
Respond ONLY in valid JSON.`,
      agentPrompt
    );

    const text = extractText(response);
    const parsed = parseClaudeJson(text);
    const escalations = parsed.escalations || [];
    
    if (!escalations.length) return;

    let ticketsModified = false;
    
    // Apply escalations to local storage and notify the UI
    for (const escalation of escalations) {
      const ticketIndex = allTickets.findIndex(t => t.ticketId === escalation.ticketId);
      if (ticketIndex > -1 && allTickets[ticketIndex].status !== 'Escalated') {
        
        allTickets[ticketIndex].status = 'Escalated';
        allTickets[ticketIndex].escalationReason = escalation.reason;
        allTickets[ticketIndex].escalatedAt = new Date().toISOString();
        ticketsModified = true;
        
        onEscalation({
          ticketId: escalation.ticketId,
          reason: escalation.reason,
          urgency: escalation.urgency,
          timestamp: new Date()
        });
      }
    }
    
    if (ticketsModified) {
      saveTickets(allTickets);
    }
    
  } catch (err) {
    console.error('SLA Monitor Error:', err);
  }
}

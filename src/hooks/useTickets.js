import { useState, useEffect } from 'react';
import { supabase } from '../supabase.js';

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription = null;

    async function fetchTickets() {
      if (!supabase) {
        // Fallback for when supabase is not properly configured
        console.warn("Supabase is not configured. Falling back to empty array.");
        setTickets([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .order('filed_at', { ascending: false });

        if (error) throw error;

        if (data) {
          // Map SQL schema back to JS objects matching the frontend mock shape
          const jsTickets = data.map(row => ({
            ticketId: row.ticket_id,
            citizenName: row.citizen_name,
            location: row.location,
            sector: row.location,
            category: row.category,
            subcategory: row.subcategory,
            department: row.department,
            description: row.description,
            priority: row.priority,
            status: row.status,
            isDuplicate: row.is_duplicate,
            duplicateCount: row.duplicate_count,
            assignedOfficerName: row.assigned_officer_name,
            assignedOfficerId: row.assigned_officer_id,
            agentSummary: row.agent_summary,
            classificationConfidence: row.classification_confidence,
            classificationReasoning: row.classification_reasoning,
            severityJustification: row.severity_justification,
            estimatedResolutionDays: row.estimated_resolution_days,
            agentTrace: row.agent_trace,
            mediaEvidence: row.media_evidence,
            escalatedAt: row.escalated_at,
            escalationReason: row.escalation_reason,
            filedAt: row.filed_at,
            date: new Date(row.filed_at).toISOString().slice(0, 10)
          }));
          setTickets(jsTickets);
        }
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();

    // Setup Realtime Subscription
    if (supabase) {
      subscription = supabase
        .channel('public:tickets')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, (payload) => {
          console.log("Realtime ticket update:", payload);
          // Refetch everything on change for simplicity, or we could optimistic update
          fetchTickets();
        })
        .subscribe();
    }

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  return { tickets, loading, error, setTickets };
}

export async function saveTicketToSupabase(ticket) {
  if (!supabase) return false;
  
  const mappedTicket = {
    ticket_id: ticket.ticketId,
    citizen_name: ticket.citizenName || ticket.citizen || 'Anonymous Citizen',
    location: ticket.location || ticket.sector || 'Unknown',
    category: ticket.category,
    subcategory: ticket.subcategory,
    department: ticket.department || 'PWD',
    description: ticket.description || 'No description provided.',
    priority: ticket.priority,
    status: ticket.status,
    is_duplicate: ticket.isDuplicate || false,
    duplicate_count: ticket.duplicateCount || 1,
    assigned_officer_name: ticket.assignedOfficerName,
    assigned_officer_id: ticket.assignedOfficerId,
    agent_summary: ticket.agentSummary,
    classification_confidence: ticket.classificationConfidence,
    classification_reasoning: ticket.classificationReasoning,
    severity_justification: ticket.severityJustification,
    estimated_resolution_days: ticket.estimatedResolutionDays,
    agent_trace: ticket.agentTrace ? JSON.parse(JSON.stringify(ticket.agentTrace)) : null,
    media_evidence: ticket.mediaEvidence ? JSON.parse(JSON.stringify(ticket.mediaEvidence)) : null,
    escalated_at: ticket.escalatedAt,
    escalation_reason: ticket.escalationReason,
    filed_at: ticket.filedAt || ticket.filed || ticket.date || new Date().toISOString()
  };

  const { error } = await supabase.from('tickets').upsert([mappedTicket], { onConflict: 'ticket_id' });
  if (error) {
    console.error('Supabase Upsert Error:', error);
    throw error;
  }
  return true;
}

// ============== MOCK DATA FOR UPGOV ==============

export const SECTORS = [
  'Sector 1','Sector 2','Sector 3','Sector 4','Sector 5','Sector 6','Sector 7','Sector 8','Sector 9','Sector 10',
  'Sector 11','Sector 12','Sector 13','Sector 14','Sector 15','Sector 16','Sector 17','Sector 18','Sector 19','Sector 20',
  'Sector 21','Sector 22','Sector 23','Sector 24','Sector 25','Sector 26','Sector 27','Sector 28','Sector 29','Sector 30',
  'Sector 31','Sector 32','Sector 33','Sector 34','Sector 35','Sector 36','Sector 37','Sector 38','Sector 39','Sector 40',
  'Sector 41','Sector 42','Sector 43','Sector 44','Sector 45','Sector 46','Sector 47','Sector 48','Sector 49','Sector 50',
  'Knowledge Park I','Knowledge Park II','Knowledge Park III',
  'Alpha 1','Alpha 2','Beta 1','Beta 2','Gamma 1','Gamma 2',
  'Delta 1','Delta 2','Omega','Mu','Chi','Phi','Pi','Psi','Pari Chowk'
];

export const CATEGORIES = [
  'Roads & Potholes','Water Supply','Sanitation','Electricity',
  'Public Lighting','Encroachment','Noise Pollution','Environmental/Green','Other'
];

export const SUBCATEGORIES = {
  'Roads & Potholes': ['Pothole','Road Damage','Missing Signage','Speed Breaker Issue','Waterlogging on Road'],
  'Water Supply': ['No Water','Low Pressure','Contaminated Water','Pipe Leakage','Billing Issue'],
  'Sanitation': ['Garbage Not Collected','Open Drain','Clogged Sewer','Public Toilet Maintenance','Mosquito Breeding'],
  'Electricity': ['Power Outage','Voltage Fluctuation','Billing Dispute','Transformer Issue','Illegal Connection'],
  'Public Lighting': ['Street Light Not Working','Dim Light','Broken Pole','New Light Request','Timer Issue'],
  'Encroachment': ['Footpath Blocked','Illegal Construction','Vendor Encroachment','Parking Encroachment','Green Belt Encroachment'],
  'Noise Pollution': ['Construction Noise','Loudspeaker','Traffic Noise','Industrial Noise','Late Night Disturbance'],
  'Environmental/Green': ['Tree Cutting','Illegal Dumping','Air Pollution','Water Body Pollution','Green Space Maintenance'],
  'Other': ['General Inquiry','Suggestion','Other Complaint']
};

export const DEPARTMENTS = ['PWD','Jal Board','India Sanitation','PVVNL','Environment Cell','Public Works'];
export const OFFICERS = ['Rajesh Kumar','Priya Singh','Amit Sharma','Neha Gupta','Vikram Verma','Sunita Yadav','Manoj Tiwari','Kavita Joshi'];

export const OFFICER_BY_SECTOR = {
  'Sector 36': { id: 'OFF-2241', name: 'Officer Sharma' },
  'Sector 12': { id: 'OFF-2289', name: 'Amit Sharma' },
  'Alpha 1': { id: 'OFF-2198', name: 'Rajesh Kumar' },
  'Alpha 2': { id: 'OFF-2144', name: 'Priya Singh' },
  'Beta 1': { id: 'OFF-2334', name: 'Sunita Yadav' },
  'Beta 2': { id: 'OFF-2312', name: 'Neha Gupta' },
  'Gamma 1': { id: 'OFF-2297', name: 'Vikram Verma' },
  'Gamma 2': { id: 'OFF-2305', name: 'Vikram Verma' },
  'Knowledge Park I': { id: 'OFF-2252', name: 'Neha Gupta' },
  'Knowledge Park II': { id: 'OFF-2218', name: 'Manoj Tiwari' },
  'Knowledge Park III': { id: 'OFF-2381', name: 'Kavita Joshi' },
  'Delta 1': { id: 'OFF-2395', name: 'Manoj Tiwari' },
  'Pari Chowk': { id: 'OFF-2412', name: 'Kavita Joshi' },
  default: { id: 'OFF-2101', name: 'Priya Singh' },
};

export const SLA_WINDOWS = {
  'Roads & Potholes': 4,
  'Water Supply': 3,
  Electricity: 2,
  Sanitation: 3,
  default: 4,
};

export const MOCK_CITIZEN_COMPLAINTS = [
  { ticketId:'IND-284731', date:'2026-03-28', category:'Roads & Potholes', location:'Sector 36', status:'Resolved', priority:'High', rating:4, duplicateCount:1, filedAt:'2026-03-28T10:00:00+05:30' },
  { ticketId:'IND-291045', date:'2026-03-29', category:'Water Supply', location:'Alpha 1', status:'In Progress', priority:'Critical', rating:null, duplicateCount:1, filedAt:'2026-03-29T10:00:00+05:30' },
  { ticketId:'IND-295612', date:'2026-03-29', category:'Sanitation', location:'Knowledge Park II', status:'Assigned', priority:'Medium', rating:null, duplicateCount:1, filedAt:'2026-03-29T11:00:00+05:30' },
  { ticketId:'IND-298834', date:'2026-03-30', category:'Public Lighting', location:'Beta 2', status:'Filed', priority:'Low', rating:null, duplicateCount:1, filedAt:'2026-03-30T09:00:00+05:30' },
  { ticketId:'IND-301256', date:'2026-03-30', category:'Electricity', location:'Pari Chowk', status:'Verified', priority:'High', rating:null, duplicateCount:1, filedAt:'2026-03-30T14:00:00+05:30' },
];

export const MOCK_OFFICER_TICKETS = [
  { ticketId:'IND-280112', category:'Roads & Potholes', sector:'Sector 36', priority:'Critical', citizen:'Arun Mehta', filed:'2026-03-29', filedAt:'2026-03-29T10:00:00+05:30', slaDeadline:'2026-04-02', description:'Large pothole near Sector 36 market causing accidents. Multiple vehicles damaged. Needs urgent repair.', status:'new', photo:true, duplicateCount:1 },
  { ticketId:'IND-281445', category:'Water Supply', sector:'Alpha 1', priority:'High', citizen:'Meera Devi', filed:'2026-03-29', filedAt:'2026-03-29T10:00:00+05:30', slaDeadline:'2026-04-01', description:'No water supply for 3 days in Alpha 1, Block C. Entire colony affected. Tanker service also not available.', status:'new', photo:false, duplicateCount:1 },
  { ticketId:'IND-282901', category:'Electricity', sector:'Knowledge Park I', priority:'High', citizen:'Suresh Pal', filed:'2026-03-30', filedAt:'2026-03-30T10:00:00+05:30', slaDeadline:'2026-04-01', description:'Frequent power outages in Knowledge Park I. Voltage fluctuations damaging electronics. Transformer sparking observed.', status:'verified', photo:true, duplicateCount:1 },
  { ticketId:'IND-283567', category:'Sanitation', sector:'Beta 2', priority:'Medium', citizen:'Fatima Khan', filed:'2026-03-30', filedAt:'2026-03-30T11:00:00+05:30', slaDeadline:'2026-04-02', description:'Garbage not collected for a week. Piles of waste near community park. Stray dog menace increasing.', status:'verified', photo:true, duplicateCount:1 },
  { ticketId:'IND-284210', category:'Public Lighting', sector:'Gamma 1', priority:'Low', citizen:'Deepak Jain', filed:'2026-03-30', filedAt:'2026-03-30T12:00:00+05:30', slaDeadline:'2026-04-04', description:'Street lights not working in Gamma 1 main road. Dark stretch of 500m. Safety concern for pedestrians.', status:'inprogress', photo:false, duplicateCount:1 },
  { ticketId:'IND-285678', category:'Roads & Potholes', sector:'Sector 12', priority:'High', citizen:'Kavita Mishra', filed:'2026-03-30', filedAt:'2026-03-30T13:00:00+05:30', slaDeadline:'2026-04-03', description:'Road cave-in near drainage line. Two-wheeler fell into the hole. Barricade needed urgently.', status:'inprogress', photo:true, duplicateCount:1 },
  { ticketId:'IND-286045', category:'Water Supply', sector:'Delta 1', priority:'Medium', citizen:'Ravi Shankar', filed:'2026-03-30', filedAt:'2026-03-30T14:00:00+05:30', slaDeadline:'2026-04-03', description:'Low water pressure in Delta 1, top floors not getting water at all. Need pump station check.', status:'resolved', photo:false, duplicateCount:1 },
  { ticketId:'IND-287334', category:'Sanitation', sector:'Pari Chowk', priority:'Low', citizen:'Geeta Rawat', filed:'2026-03-30', filedAt:'2026-03-30T15:00:00+05:30', slaDeadline:'2026-04-04', description:'Public toilet near Pari Chowk bus stop needs maintenance. No water supply in toilet.', status:'resolved', photo:false, duplicateCount:1 },
  { ticketId:'IND-288901', category:'Encroachment', sector:'Sector 18', priority:'Medium', citizen:'Mohit Aggarwal', filed:'2026-03-30', filedAt:'2026-03-30T16:00:00+05:30', slaDeadline:'2026-04-05', description:'Illegal vendors blocking the footpath near Sector 18 market. Pedestrians forced to walk on main road.', status:'new', photo:true, duplicateCount:1 },
  { ticketId:'IND-289567', category:'Environmental/Green', sector:'Omega', priority:'High', citizen:'Anita Sharma', filed:'2026-03-30', filedAt:'2026-03-30T17:00:00+05:30', slaDeadline:'2026-04-03', description:'Illegal dumping of construction waste near Omega park. Toxic materials visible. Children play nearby.', status:'verified', photo:true, duplicateCount:1 },
];

export const DEPT_PERFORMANCE = [
  { department:'PWD', active:45, resolved:312, sla:91.2, avgDays:4.2, officers:18, rating:4.1 },
  { department:'Jal Board', active:38, resolved:256, sla:87.5, avgDays:5.1, officers:14, rating:3.8 },
  { department:'PVVNL', active:22, resolved:198, sla:94.8, avgDays:2.8, officers:12, rating:4.3 },
  { department:'India Sanitation', active:51, resolved:289, sla:82.3, avgDays:5.8, officers:22, rating:3.5 },
  { department:'Environment Cell', active:15, resolved:87, sla:89.1, avgDays:6.2, officers:8, rating:3.9 },
  { department:'Public Works', active:28, resolved:178, sla:90.5, avgDays:4.5, officers:15, rating:4.0 },
];

export const HEATMAP_SECTORS = [
  { name:'Alpha 1', lat: 28.471, lng: 77.512, complaints:42, topType:'Water Supply', resolved:85, avgDays:4.1 },
  { name:'Alpha 2', lat: 28.476, lng: 77.518, complaints:18, topType:'Roads', resolved:92, avgDays:3.2 },
  { name:'Beta 1', lat: 28.468, lng: 77.505, complaints:31, topType:'Sanitation', resolved:78, avgDays:5.5 },
  { name:'Beta 2', lat: 28.462, lng: 77.501, complaints:25, topType:'Electricity', resolved:88, avgDays:3.8 },
  { name:'Gamma 1', lat: 28.455, lng: 77.498, complaints:14, topType:'Lighting', resolved:95, avgDays:2.1 },
  { name:'Gamma 2', lat: 28.452, lng: 77.492, complaints:8, topType:'Roads', resolved:97, avgDays:1.8 },
  { name:'Delta 1', lat: 28.482, lng: 77.525, complaints:36, topType:'Water Supply', resolved:72, avgDays:6.1 },
  { name:'Delta 2', lat: 28.488, lng: 77.531, complaints:22, topType:'Sanitation', resolved:81, avgDays:4.9 },
  { name:'Omega', lat: 28.442, lng: 77.508, complaints:29, topType:'Environmental', resolved:76, avgDays:5.3 },
  { name:'Sector 12', lat: 28.495, lng: 77.542, complaints:45, topType:'Roads', resolved:68, avgDays:6.8 },
  { name:'Sector 18', lat: 28.425, lng: 77.482, complaints:33, topType:'Encroachment', resolved:82, avgDays:4.4 },
  { name:'Sector 36', lat: 28.411, lng: 77.465, complaints:55, topType:'Roads', resolved:58, avgDays:7.2 },
  { name:'Knowledge Park I', lat: 28.465, lng: 77.485, complaints:48, topType:'Electricity', resolved:65, avgDays:6.5 },
  { name:'Knowledge Park II', lat: 28.455, lng: 77.485, complaints:20, topType:'Sanitation', resolved:90, avgDays:3.5 },
  { name:'Knowledge Park III', lat: 28.445, lng: 77.485, complaints:12, topType:'Lighting', resolved:93, avgDays:2.5 },
  { name:'Pari Chowk', lat: 28.463, lng: 77.510, complaints:38, topType:'Roads', resolved:71, avgDays:5.9 },
  { name:'Mu', lat: 28.435, lng: 77.515, complaints:10, topType:'Water Supply', resolved:94, avgDays:2.3 },
  { name:'Chi', lat: 28.425, lng: 77.525, complaints:16, topType:'Sanitation', resolved:88, avgDays:3.9 },
];

export const SLA_TICKETS = [
  { ticketId:'IND-280112', category:'Roads', sector:'Sector 36', priority:'Critical', deadline:'2026-03-13', status:'Breached', officer:'Vikram Verma' },
  { ticketId:'IND-281445', category:'Water Supply', sector:'Alpha 1', priority:'High', deadline:'2026-03-15', status:'Breached', officer:'Rajesh Kumar' },
  { ticketId:'IND-289001', category:'Electricity', sector:'KP I', priority:'High', deadline:'2026-03-20', status:'<24hrs', officer:'Neha Gupta' },
  { ticketId:'IND-289234', category:'Sanitation', sector:'Delta 1', priority:'Medium', deadline:'2026-03-20', status:'<24hrs', officer:'Manoj Tiwari' },
];

export const ACTIVITY_FEED = [
  { time:'2 min ago', event:'IND-301256 filed — Electricity outage in Pari Chowk', type:'filed' },
  { time:'8 min ago', event:'IND-298834 assigned to Officer Kavita Joshi', type:'assigned' },
  { time:'15 min ago', event:'IND-295612 verified on-site by Officer Amit Sharma', type:'verified' },
  { time:'22 min ago', event:'IND-291045 escalated — SLA breach warning', type:'escalated' },
  { time:'35 min ago', event:'IND-289567 flagged for Heavy Machinery resources', type:'flagged' },
];

export const CARBON_DATA = [
  { ticketId:'IND-278001', issue:'Illegal dumping near Omega park', status:'Resolved', greenTag:'Waste Cleared', carbonScore:12 },
  { ticketId:'IND-279234', issue:'Tree cutting in Sector 22', status:'In Progress', greenTag:'Tree Restored', carbonScore:25 },
  { ticketId:'IND-280567', issue:'Water body pollution in Chi sector', status:'Resolved', greenTag:'Water Cleaned', carbonScore:18 },
  { ticketId:'IND-283123', issue:'Green belt encroachment in Gamma 2', status:'Resolved', greenTag:'Space Reclaimed', carbonScore:30 },
  { ticketId:'IND-284456', issue:'Plastic waste dumping near Pari Chowk', status:'Resolved', greenTag:'Waste Recycled', carbonScore:15 },
];

export const WEEKLY_RESOLUTION = [
  { week:'W1 Feb', resolved:42 },{ week:'W2 Feb', resolved:38 },{ week:'W3 Feb', resolved:51 },
  { week:'W4 Feb', resolved:45 },{ week:'W1 Mar', resolved:55 },{ week:'W2 Mar', resolved:48 },
];

export const MONTHLY_TREND = [
  { month:'Oct', filed:280, resolved:265 },{ month:'Nov', filed:310, resolved:298 },
  { month:'Dec', filed:245, resolved:240 },{ month:'Jan', filed:325, resolved:305 },
  { month:'Feb', filed:290, resolved:278 },{ month:'Mar', filed:172, resolved:158 },
];

export const SLA_BREACH_TREND = [
  { day:'Mar 1', breaches:3 },{ day:'Mar 5', breaches:5 },{ day:'Mar 10', breaches:2 },
  { day:'Mar 15', breaches:4 },{ day:'Mar 19', breaches:3 },
];

export const CARBON_MONTHLY = [
  { month:'Oct', actions:15, co2:120 },{ month:'Nov', actions:22, co2:180 },
  { month:'Dec', actions:18, co2:145 },{ month:'Jan', actions:28, co2:230 },
  { month:'Feb', actions:25, co2:200 },{ month:'Mar', actions:12, co2:95 },
];

export const CATEGORY_DISTRIBUTION = [
  { name:'Roads & Potholes', value:320, color:'#DC2626' },
  { name:'Water Supply', value:256, color:'#003366' },
  { name:'Sanitation', value:289, color:'#ff9933' },
  { name:'Electricity', value:198, color:'#6366f1' },
  { name:'Public Lighting', value:145, color:'#10B981' },
  { name:'Environmental', value:87, color:'#16A34A' },
];

export const TRACK_STEPS = [
  { label:'Filed' },
  { label:'AI Classified' },
  { label:'Assigned' },
  { label:'Verified On-Site' },
  { label:'In Progress' },
  { label:'Resolved' },
  { label:'Feedback' },
];

export const ACTIVITY_HEATMAP_DATA = [
  { day:'Mon', hours:[2,1,0,0,0,1,3,8,14,18,22,20,16,15,17,19,21,18,12,8,5,4,3,2] },
  { day:'Tue', hours:[1,1,0,0,1,2,4,10,16,20,24,22,18,17,19,21,23,20,14,9,6,4,3,1] },
  { day:'Wed', hours:[3,2,1,0,0,1,5,12,18,24,28,26,20,19,22,25,27,22,16,10,7,5,3,2] },
  { day:'Thu', hours:[2,1,0,0,0,2,4,9,15,19,23,21,17,16,18,20,22,19,13,8,5,3,2,1] },
  { day:'Fri', hours:[1,0,0,0,1,3,6,11,17,22,26,24,19,18,20,23,25,21,15,10,6,4,2,1] },
  { day:'Sat', hours:[4,3,2,1,0,1,2,5,8,10,12,11,9,8,7,6,5,4,3,3,4,5,4,3] },
  { day:'Sun', hours:[3,2,1,1,0,0,1,3,5,7,8,7,6,5,4,3,3,2,2,2,3,4,3,2] },
];

export const ADMIN_COMPLAINT_CARDS = [
  { ticketId:'IND-280112', category:'Roads & Potholes', sector:'Sector 36', priority:'Critical', citizen:'Arun Mehta', status:'In Progress', likes:10547, color:'#DC2626', description:'Large pothole near market causing accidents' },
  { ticketId:'IND-281445', category:'Water Supply', sector:'Alpha 1', priority:'High', citizen:'Meera Devi', status:'Assigned', likes:8234, color:'#003366', description:'No water supply for 3 days in Block C' },
  { ticketId:'IND-282901', category:'Electricity', sector:'Knowledge Park I', priority:'High', citizen:'Suresh Pal', status:'Verified', likes:6891, color:'#6366f1', description:'Frequent power outages, transformer sparking' },
  { ticketId:'IND-283567', category:'Sanitation', sector:'Beta 2', priority:'Medium', citizen:'Fatima Khan', status:'Filed', likes:5432, color:'#ff9933', description:'Garbage not collected for a week near park' },
  { ticketId:'IND-284210', category:'Public Lighting', sector:'Gamma 1', priority:'Low', citizen:'Deepak Jain', status:'Resolved', likes:4128, color:'#10B981', description:'Street lights not working on main road' },
  { ticketId:'IND-285678', category:'Roads & Potholes', sector:'Sector 12', priority:'High', citizen:'Kavita Mishra', status:'In Progress', likes:7655, color:'#EF4444', description:'Road cave-in near drainage line' },
  { ticketId:'IND-286045', category:'Water Supply', sector:'Delta 1', priority:'Medium', citizen:'Ravi Shankar', status:'Resolved', likes:3201, color:'#003366', description:'Low water pressure in top floors' },
  { ticketId:'IND-289567', category:'Environmental/Green', sector:'Omega', priority:'High', citizen:'Anita Sharma', status:'Verified', likes:9102, color:'#16A34A', description:'Illegal dumping of construction waste near park' },
  { ticketId:'IND-288901', category:'Encroachment', sector:'Sector 18', priority:'Medium', citizen:'Mohit Aggarwal', status:'Filed', likes:2890, color:'#E11D48', description:'Illegal vendors blocking the footpath' },
];

// ============== PERSISTENCE UTILITIES ==============
import { supabase } from './supabase.js';

export const STORAGE_KEYS = {
  TICKETS: 'ps_crm_tickets_v2',
  LAST_UPDATE: 'ps_crm_last_sync'
};

export function saveTickets(tickets) {
  try {
    // 1. Save to local storage for instant UI
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());

    // 2. Fire and forget to Supabase if configured
    if (supabase) {
      // Upsert tickets to Supabase asynchronously
      // We map the JS objects to the SQL schema
      const mappedTickets = tickets.map(t => ({
        ticket_id: t.ticketId,
        citizen_name: t.citizenName || t.citizen || 'Anonymous Citizen',
        location: t.location || t.sector || 'Unknown',
        category: t.category,
        subcategory: t.subcategory,
        department: t.department || 'PWD',
        description: t.description || 'No description provided.',
        priority: t.priority,
        status: t.status,
        is_duplicate: t.isDuplicate || false,
        duplicate_count: t.duplicateCount || 1,
        assigned_officer_name: t.assignedOfficerName,
        assigned_officer_id: t.assignedOfficerId,
        agent_summary: t.agentSummary,
        classification_confidence: t.classificationConfidence,
        classification_reasoning: t.classificationReasoning,
        severity_justification: t.severityJustification,
        estimated_resolution_days: t.estimatedResolutionDays,
        agent_trace: t.agentTrace ? JSON.parse(JSON.stringify(t.agentTrace)) : null,
        media_evidence: t.mediaEvidence ? JSON.parse(JSON.stringify(t.mediaEvidence)) : null,
        escalated_at: t.escalatedAt,
        escalation_reason: t.escalationReason,
        filed_at: t.filedAt || t.filed || t.date || new Date().toISOString()
      }));

      // In a production app, we would batch this or only upsert changed tickets.
      // For this demo, we'll upsert the whole array.
      supabase
        .from('tickets')
        .upsert(mappedTickets, { onConflict: 'ticket_id' })
        .then(({ error }) => {
          if (error) console.error('Supabase Sync Error:', error);
        });
    }
  } catch (e) {
    console.warn('Failed to save tickets:', e);
  }
}

/**
 * Syncs local storage with the Supabase database on app load.
 * Returns true if new data was fetched.
 */
export async function syncWithSupabase() {
  if (!supabase) return false;
  
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('filed_at', { ascending: false });
      
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Map back from SQL schema to JS object
      const jsTickets = data.map(row => ({
        ticketId: row.ticket_id,
        citizenName: row.citizen_name,
        location: row.location,
        sector: row.location, // Alias for UI
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
      
      // Save directly to localStorage to avoid infinite loops, bypassing the Supabase upsert
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(jsTickets));
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
      return true;
    }
  } catch (e) {
    console.error('Failed to sync from Supabase:', e);
  }
  return false;
}

export function loadTicketsFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn('Failed to load tickets from localStorage:', e);
    return null;
  }
}

/**
 * Initializes a unified ticket list by merging mock data with stored user data.
 * This ensures that the demo looks full on first load, but preserves user changes thereafter.
 */
export function getInitialTickets() {
  const stored = loadTicketsFromStorage();
  if (stored && stored.length > 0) return stored;

  // If no storage, combine all mock sets into one "master list" for the session
  const masterList = [...MOCK_CITIZEN_COMPLAINTS, ...MOCK_OFFICER_TICKETS];
  
  // Dedup by ticketId
  const seen = new Set();
  const deduped = masterList.filter(t => {
    if (!t.ticketId) return false;
    if (seen.has(t.ticketId)) return false;
    seen.add(t.ticketId);
    return true;
  });

  saveTickets(deduped);
  return deduped;
}

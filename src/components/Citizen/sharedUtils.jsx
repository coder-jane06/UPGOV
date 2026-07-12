import React from 'react';
import {
  BarChart3, Droplets, Leaf, MapIcon, Search, History, FileText, Wrench, Trash2, Zap, Lightbulb, Building2, Volume2, CircleHelp
} from 'lucide-react';
import { OFFICER_BY_SECTOR, SUBCATEGORIES, SLA_WINDOWS } from '../../data.js';

export const SECTOR_OFFICER_MAP = OFFICER_BY_SECTOR;

export const SIDEBAR_ITEMS = [
  { id: 'file', labelKey: 'citizen.file', icon: <FileText className="h-4 w-4" /> },
  { id: 'track', labelKey: 'citizen.track', icon: <Search className="h-4 w-4" /> },
  { id: 'history', labelKey: 'citizen.history', icon: <History className="h-4 w-4" /> },
  { id: 'heatmap', labelKey: 'admin.heatmap', icon: <MapIcon className="h-4 w-4" /> },
  { id: 'carbon', labelKey: 'admin.carbonTracker', icon: <Leaf className="h-4 w-4" /> },
  { id: 'public', labelKey: 'nav.publicDash', icon: <BarChart3 className="h-4 w-4" /> },
];

export const INITIAL_FORM = {
  category: '',
  subcategory: '',
  description: '',
  location: '',
  name: 'Rahul Singh',
  email: 'citizen@india.gov.in',
  phone: '+91 98111 11222',
  mediaFiles: [],
};

export const FIELD_IDS = {
  category: 'citizen-category-grid',
  subcategory: 'citizen-subcategory',
  description: 'citizen-description',
  location: 'citizen-location',
  media: 'citizen-media',
};

export const CATEGORY_META = {
  'Roads & Potholes': { Icon: Wrench, circle: '#FEF3C7', color: '#ff9933' },
  'Water Supply': { Icon: Droplets, circle: '#DBEAFE', color: '#003366' },
  Sanitation: { Icon: Trash2, circle: '#DCFCE7', color: '#15803D' },
  Electricity: { Icon: Zap, circle: '#FEF9C3', color: '#ff9933' },
  'Public Lighting': { Icon: Lightbulb, circle: '#FFF7ED', color: '#ff9933' },
  Encroachment: { Icon: Building2, circle: '#FEE2E2', color: '#B91C1C' },
  'Noise Pollution': { Icon: Volume2, circle: '#F3E8FF', color: '#7C3AED' },
  'Environmental/Green': { Icon: Leaf, circle: '#ECFDF5', color: '#0F766E' },
  Other: { Icon: CircleHelp, circle: '#F1F5F9', color: '#475569' },
};

export const MAX_MEDIA_FILES = 3;
export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

export function inferCategoryFromText(input) {
  const text = String(input || '').toLowerCase();
  if (/(pothole|road|waterlog|speed breaker|signage)/.test(text)) return { category: 'Roads & Potholes', subcategory: 'Pothole' };
  if (/(water|pipe|supply|leak|pressure)/.test(text)) return { category: 'Water Supply', subcategory: 'No Water' };
  if (/(garbage|sewer|drain|sanitation|waste|mosquito)/.test(text)) return { category: 'Sanitation', subcategory: 'Garbage Not Collected' };
  if (/(street ?light|lighting|lamp|dark)/.test(text)) return { category: 'Public Lighting', subcategory: 'Street Light Not Working' };
  if (/(electric|power|voltage|transformer)/.test(text)) return { category: 'Electricity', subcategory: 'Power Outage' };
  return { category: 'Other', subcategory: 'Other Complaint' };
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getCountdown(ticket, t) {
  const days = SLA_WINDOWS[ticket.category] || SLA_WINDOWS.default;
  const start = new Date(ticket.filedAt || `${ticket.date}T10:00:00+05:30`).getTime();
  const end = start + days * 24 * 60 * 60 * 1000;
  const remainMs = end - Date.now();
  const totalMs = end - start;

  if (remainMs <= 0) {
    return { label: t('officer.slaBreached'), progress: 100, breached: true };
  }

  const hours = Math.floor(remainMs / (1000 * 60 * 60));
  const daysRemaining = Math.floor(hours / 24);
  const hoursRemaining = hours % 24;
  const usedPercent = Math.max(0, Math.min(100, ((totalMs - remainMs) / totalMs) * 100));

  return {
    label: t('officer.slaRemainingShort', { days: daysRemaining, hours: hoursRemaining }),
    progress: usedPercent,
    breached: false,
  };
}

export { getCountdown };

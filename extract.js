import fs from 'fs';

const fileContent = fs.readFileSync('src/CitizenPortal.jsx', 'utf-8');
const lines = fileContent.split('\n');

const components = [
    { name: "GreetingBanner", start: 182, end: 196 },
    { name: "ErrorSummary", start: 197, end: 235 },
    { name: "getCountdown", start: 236, end: 258 },
    { name: "AIVoiceAssistant", start: 259, end: 502 },
    { name: "MediaUploader", start: 503, end: 655 },
    { name: "FileComplaint", start: 656, end: 1399 },
    { name: "TrackComplaint", start: 1400, end: 1568 },
    { name: "WhatsAppBot", start: 1569, end: 1678 },
    { name: "MyComplaints", start: 1679, end: 1901 },
    { name: "MyHistory", start: 1902, end: 2024 },
    { name: "Heatmap", start: 2025, end: 2150 },
    { name: "CarbonTracker", start: 2151, end: 2215 }
];

const sharedUtilsImports = `import React from 'react';
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
`;

fs.writeFileSync('src/components/Citizen/sharedUtils.jsx', sharedUtilsImports, 'utf-8');
console.log("Wrote sharedUtils.jsx");

const newImports = `import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3, Brain, Building2, CheckCircle2, ChevronRight, CircleHelp,
  ClipboardCheck, ClipboardList, Copy, Droplets, Eye, FileText, History,
  Leaf, Lightbulb, MapIcon, MapPin, MessageCircle, Search, Send,
  RefreshCw, Star, Trash2, TrendingUp, UserCheck, Volume2, Wrench, Zap,
  ChevronDown, ChevronUp, UploadCloud, X, Mic, MicOff, Globe, Bot, Sparkles, Camera
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import ARScanner from '../../ARScanner.jsx';
import { DashboardShell, DepartmentBadge, ErrorCard, InlineSpinner, PageHeader, PriorityBadge, SectionSkeleton, StatusBadge } from '../../Shared.jsx';
import { callClaude, parseClaudeJson, runAgentLoop } from '../../ai.js';
import AgentTrace from '../AgentTrace.jsx';
import { useTickets, saveTicketToSupabase } from '../../hooks/useTickets.js';
import { translateCategory, translateDepartment, translatePriority, translateSectorName, translateStatus, translateSubcategory } from '../../i18n/helpers.js';
import { CATEGORIES, MOCK_CITIZEN_COMPLAINTS, OFFICER_BY_SECTOR, SECTORS, SLA_WINDOWS, SUBCATEGORIES, TRACK_STEPS, getInitialTickets, saveTickets, HEATMAP_SECTORS, CARBON_DATA, CARBON_MONTHLY, DEPT_PERFORMANCE } from '../../data.js';
import { SECTOR_OFFICER_MAP, SIDEBAR_ITEMS, INITIAL_FORM, FIELD_IDS, CATEGORY_META, MAX_MEDIA_FILES, GROQ_API_KEY, inferCategoryFromText, fileToDataUrl } from './sharedUtils.jsx';
`;

// Extract getCountdown separately because it's used inside other files.
const getCountdownLines = lines.slice(236, 259).join('\\n');
const sharedUtilsFinal = sharedUtilsImports + '\\n' + getCountdownLines + '\\nexport { getCountdown };\\n';
fs.writeFileSync('src/components/Citizen/sharedUtils.jsx', sharedUtilsFinal.replace(/\\n/g, '\\n'), 'utf-8');

for (const comp of components) {
    if (comp.name === "getCountdown") continue;
    let componentCode = lines.slice(comp.start, comp.end + 1).join('\\n');
    let fullCode = newImports + "\\nimport { getCountdown } from './sharedUtils.jsx';\\n\\n" + componentCode + '\\n\\nexport default ' + comp.name + ';\\n';
    fs.writeFileSync('src/components/Citizen/' + comp.name + '.jsx', fullCode.replace(/\\n/g, '\\n'), 'utf-8');
    console.log("Wrote " + comp.name);
}

const componentNames = components.filter(c => c.name !== "getCountdown").map(c => c.name);

let newPortalLines = [];
let insideOldDefinitions = false;
let importsAdded = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we are inside the chunk to remove
    if (i >= 92 && i <= 2215) {
        if (!importsAdded) {
            newPortalLines.push("import { SIDEBAR_ITEMS } from './components/Citizen/sharedUtils.jsx';");
            for (const name of componentNames) {
                newPortalLines.push("import " + name + " from './components/Citizen/" + name + ".jsx';");
            }
            importsAdded = true;
        }
        continue;
    }
    newPortalLines.push(line);
}

fs.writeFileSync('src/CitizenPortal.jsx', newPortalLines.join('\\n').replace(/\\n/g, '\\n'), 'utf-8');
console.log("Updated CitizenPortal.jsx");

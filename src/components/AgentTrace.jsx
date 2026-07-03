import React, { useState } from 'react';
import { Brain, ChevronDown, Search, Tag, AlertTriangle, CheckCircle2, Loader2, XCircle, Merge, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOOL_META = {
  find_duplicate: {
    icon: Search,
    label: 'Duplicate Detection',
    color: '#6366f1',
    bgColor: '#EEF2FF',
    description: 'Scanning existing tickets for semantic matches',
  },
  classify_ticket: {
    icon: Tag,
    label: 'AI Classification',
    color: '#0891b2',
    bgColor: '#ECFEFF',
    description: 'Categorizing complaint and assigning department',
  },
  assess_severity: {
    icon: AlertTriangle,
    label: 'Severity Assessment',
    color: '#dc2626',
    bgColor: '#FEF2F2',
    description: 'Evaluating priority based on impact and department load',
  },
  system: {
    icon: XCircle,
    label: 'System',
    color: '#dc2626',
    bgColor: '#FEF2F2',
    description: 'System event',
  },
};

const STATUS_ICON = {
  running: Loader2,
  done: CheckCircle2,
  error: XCircle,
};

function TraceStep({ step, index, isLast }) {
  const meta = TOOL_META[step.tool] || TOOL_META.system;
  const Icon = meta.icon;
  const StatusIcon = STATUS_ICON[step.status] || Loader2;
  const isRunning = step.status === 'running';
  const isDone = step.status === 'done';
  const isError = step.status === 'error';

  // Extract the most useful output text
  const outputText = step.output
    ? step.output.reasoning ||
      step.output.justification ||
      step.output.reason ||
      (step.output.isDuplicate
        ? `Match found: ${step.output.matchedId} (${step.output.confidence}% confidence)`
        : step.output.category
          ? `${step.output.category} → ${step.output.department} (${step.output.confidence}%)`
          : step.output.priority
            ? `${step.output.priority} priority — Est. ${step.output.estimatedResolutionDays} days`
            : step.output.error || JSON.stringify(step.output).slice(0, 120))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="flex gap-4"
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
            isRunning
              ? 'shadow-lg'
              : isDone
                ? 'shadow-sm'
                : 'shadow-sm'
          }`}
          style={{
            background: isRunning ? meta.color : isDone ? meta.bgColor : '#FEF2F2',
          }}
        >
          <Icon
            className={`h-5 w-5 ${isRunning ? 'text-white' : ''}`}
            style={{ color: isRunning ? undefined : meta.color }}
          />
          {isRunning && (
            <span
              className="absolute inset-[-4px] rounded-xl border-2 animate-ping opacity-30"
              style={{ borderColor: meta.color }}
            />
          )}
        </div>
        {!isLast && (
          <div
            className="mt-1 w-[2px] flex-1 min-h-[20px] rounded-full transition-colors"
            style={{ background: isDone ? meta.color + '40' : '#e2e8f0' }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-black tracking-tight" style={{ color: meta.color }}>
            {meta.label}
          </span>
          <StatusIcon
            className={`h-3.5 w-3.5 ${
              isRunning ? 'animate-spin text-amber-500' : isDone ? 'text-emerald-500' : 'text-red-500'
            }`}
          />
        </div>
        <p className="mt-0.5 text-[12px] font-medium text-slate-400">
          {isRunning ? meta.description + '...' : isDone ? 'Complete' : 'Failed'}
        </p>

        {/* Output card */}
        {outputText && isDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.25 }}
            className="mt-2.5 rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3"
          >
            <p className="text-[12px] font-semibold leading-relaxed text-slate-600">
              → {outputText}
            </p>
          </motion.div>
        )}

        {/* Error card */}
        {isError && step.output?.error && (
          <div className="mt-2.5 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-[12px] font-semibold text-red-600">
              ⚠ {step.output.error}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Live Agent Reasoning Trace — shown during ticket processing
 * and expandable on completed tickets.
 */
export default function AgentTrace({ trace, mode = 'live' }) {
  const [expanded, setExpanded] = useState(mode === 'live');

  if (!trace?.length) return null;

  const isProcessing = trace.some(s => s.status === 'running');
  const allDone = trace.every(s => s.status === 'done' || s.status === 'error');

  if (mode === 'compact') {
    return (
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <Brain className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-black text-slate-800">Agent Reasoning Trace</p>
              <p className="text-[11px] font-medium text-slate-400">
                {trace.length} step{trace.length !== 1 ? 's' : ''} •{' '}
                {allDone ? 'Complete' : 'Processing...'}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-slate-100"
            >
              <div className="p-5 pt-4">
                {trace.map((step, i) => (
                  <TraceStep key={`${step.tool}-${i}`} step={step} index={i} isLast={i === trace.length - 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Live mode — always expanded, animated
  return (
    <div className="w-full max-w-[540px] mx-auto">
      <div className="mb-6 flex items-center justify-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[15px] font-black text-slate-800">AI Agent Processing</p>
          <p className="text-[12px] font-medium text-slate-400">
            {isProcessing ? 'Analyzing your complaint...' : 'Analysis complete'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {trace.map((step, i) => (
          <TraceStep key={`${step.tool}-${i}`} step={step} index={i} isLast={i === trace.length - 1} />
        ))}
      </div>
    </div>
  );
}

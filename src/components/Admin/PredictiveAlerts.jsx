import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, RefreshCw, Sparkles, Send, Clock3 as Timer } from 'lucide-react';
import { PageHeader, ErrorCard } from '../../Shared.jsx';
import { callClaude, parseClaudeJson } from '../../ai.js';
import { runPredictiveAnalysis } from '../../predictiveAgent.js';
import { useTickets } from '../../hooks/useTickets.js';

export default function PredictiveAlerts() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deployedByAlert, setDeployedByAlert] = useState({});
  const [environmentalRisk, setEnvironmentalRisk] = useState(null);

  const deployFieldUnit = (index) => {
    setDeployedByAlert(prev => ({ ...prev, [index]: true }));
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Run real environmental predictive analysis
      try {
  const { tickets: allTickets, loading } = useTickets();
        const envResult = await runPredictiveAnalysis(allTickets, "Sector 36");
        setEnvironmentalRisk(envResult);
      } catch (envErr) {
        console.error("Environmental analysis failed", envErr);
      }

      // 2. Run standard pattern analysis
      const text = await callClaude(
        'You are infrastructure analytics AI for UPGOV. Return ONLY valid JSON: {"alerts":[{"zone":"name","issueType":"Roads|Water|Electricity","riskLevel":"Critical|High|Medium","pattern":"text","confidence":95,"daysToCritical":3,"recommendation":"text"}]}',
        'Analyze current complaint patterns for India and generate predictive alerts.'
      );
      let parsed = parseClaudeJson(text);
      setAlerts(Array.isArray(parsed.alerts) ? parsed.alerts : []);
    } catch (err) {
      setError(t('admin.engineOutage'));
      setAlerts([
        { zone: 'Sector 36', issueType: 'Roads', riskLevel: 'Critical', pattern: 'Cluster of 12 recurring potholes identified in high-traffic commercial corridor.', confidence: 96, daysToCritical: 2, recommendation: 'Deploy immediate milling machine to Alpha-Commercial junction.' },
        { zone: 'Knowledge Park', issueType: 'Electricity', riskLevel: 'High', pattern: 'Sub-station load fluctuation detected across 4 sectors concurrently.', confidence: 89, daysToCritical: 5, recommendation: 'Secondary transformer bypass verification required.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-stage mx-auto max-w-[1000px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
           <PageHeader title={t('admin.predictiveTitle')} subtitle={t('admin.predictiveDesc')} />
        </div>
        <button type="button" 
          className={`h-[72px] rounded-[28px] px-10 manrope text-[15px] font-black uppercase tracking-[2px] transition-all flex items-center justify-center gap-4 shadow-xl ${loading ? 'bg-slate-100 text-slate-400' : 'bg-[#003366] text-white hover:bg-[#07569E] shadow-blue-900/20 active:scale-95'}`} 
          disabled={loading} 
          onClick={runAnalysis} 
          
        >
          {loading ? <RefreshCw className="h-6 w-6 animate-spin" /> : <Brain className="h-7 w-7" />}
          {loading ? t('admin.analyzingTrends') : t('admin.patternAnalysis')}
        </button>
      </div>
      
      {error && <div className="mb-8"><ErrorCard title={t('admin.aiAnalysisFailed')} message={error} /></div>}

      {/* Environmental Live Risk Card */}
      {environmentalRisk && (
        <div className="mb-12 relative overflow-hidden rounded-[32px] bg-white p-8 border border-slate-200 shadow-xl">
          <div className={`absolute top-0 right-0 w-96 h-96 rounded-full -mr-48 -mt-48 blur-3xl opacity-20`} style={{ background: environmentalRisk.riskLevel === 'Critical' ? '#DC2626' : '#ff9933' }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="manrope text-[24px] font-black tracking-tight text-slate-900">Multi-Signal Environmental Risk</h3>
                <p className="text-[13px] font-bold text-slate-500">Live Weather Data + Ticket Density Analysis</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-[1fr_250px] gap-8">
              <div>
                <p className="text-[18px] font-bold text-slate-700 italic leading-relaxed">"{environmentalRisk.prediction}"</p>
                
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="bg-slate-50 rounded-xl px-5 py-3 border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-[1px] text-slate-400 mb-1">Open-Meteo Forecast</p>
                    <p className="text-[16px] font-black text-slate-800">{environmentalRisk.weatherData.totalRain}mm <span className="text-sm font-medium text-slate-500">expected (3 days)</span></p>
                  </div>
                  <div className="bg-slate-50 rounded-xl px-5 py-3 border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-[1px] text-slate-400 mb-1">Recent Tickets ({environmentalRisk.sector})</p>
                    <p className="text-[16px] font-black text-slate-800">{environmentalRisk.ticketDensity} <span className="text-sm font-medium text-slate-500">drainage/roads issues</span></p>
                  </div>
                </div>
                
                <div className="mt-8 rounded-xl bg-slate-900 px-6 py-4">
                  <p className="text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-1">AI Recommendation</p>
                  <p className="text-[15px] font-bold text-white">{environmentalRisk.recommendation}</p>
                </div>
              </div>
              
              <div className="flex flex-col justify-center items-center rounded-2xl bg-slate-50 border border-slate-100 p-6 text-center">
                <p className="text-[12px] font-black uppercase tracking-[2px] text-slate-400 mb-2">Risk Level</p>
                <p className={`text-[36px] font-black uppercase tracking-tight leading-none ${environmentalRisk.riskLevel === 'Critical' ? 'text-red-600' : 'text-amber-600'}`}>{environmentalRisk.riskLevel}</p>
                <div className="mt-6 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${environmentalRisk.confidence}%`, background: environmentalRisk.riskLevel === 'Critical' ? '#DC2626' : '#ff9933' }} />
                </div>
                <p className="mt-2 text-[12px] font-bold text-slate-500">{environmentalRisk.confidence}% AI Confidence</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pattern Alerts */}
      {loading && (
        <div className="py-24 text-center space-y-8">
           <div className="relative mx-auto h-32 w-32">
              <div className="absolute inset-0 rounded-full border-4 border-blue-50 border-t-[#003366] animate-spin" />
              <div className="absolute inset-4 rounded-full border-4 border-slate-50 border-t-[#ff9933] animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Brain className="h-10 w-10 text-[#003366]" />
              </div>
           </div>
           <p className="manrope text-[18px] font-black text-slate-800 animate-pulse">{t('admin.analyzingTrends')}</p>
        </div>
      )}

      {!loading && alerts.length > 0 ? (
        <div className="grid gap-10">
          <div className="bg-[#eff4ff] border border-blue-100 rounded-[28px] p-6 flex items-center gap-4 shadow-sm">
             <div className="h-10 w-10 rounded-xl bg-[#003366] flex items-center justify-center text-white">
                <Sparkles className="h-5 w-5" />
             </div>
             <p className="manrope text-[14px] font-black text-[#003366]">AI Pattern Match Complete: {alerts.length} critical infrastructure sequences identified.</p>
          </div>
          {alerts.map((alert, i) => (
            <div key={i} className="group relative overflow-hidden rounded-[40px] border border-slate-100 bg-white p-10 shadow-sm hover:shadow-2xl transition-all">
              <div className="absolute top-0 left-0 h-full w-2.5" style={{ background: alert.riskLevel === 'Critical' ? '#DC2626' : alert.riskLevel === 'High' ? '#ff9933' : '#15803D' }} />
              
              <div className="mb-10 flex flex-wrap items-center justify-between gap-8">
                 <div>
                    <div className="flex items-center gap-3">
                       <h3 className="manrope text-[32px] font-black tracking-tighter text-slate-900 leading-none">{alert.zone}</h3>
                       <span className={`manrope rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[1px] text-white shadow-lg`} style={{ background: alert.riskLevel === 'Critical' ? '#DC2626' : alert.riskLevel === 'High' ? '#ff9933' : '#15803D' }}>
                          {alert.riskLevel} Risk Sequence
                       </span>
                    </div>
                    <p className="mt-3 manrope text-[11px] font-black uppercase tracking-[2px] text-slate-400">{t(`category.${alert.issueType}`) || alert.issueType} PROBABILISTIC FAILURE</p>
                 </div>
                 <div className="text-right flex items-center gap-6">
                    <div className="h-16 w-[1px] bg-slate-100 hidden sm:block" />
                    <div>
                       <p className="manrope text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-1">{t('admin.confidence')}</p>
                       <p className="manrope text-[40px] font-black tracking-tighter text-[#003366] leading-none">{alert.confidence || 92}%</p>
                    </div>
                 </div>
              </div>

              <div className="grid lg:grid-cols-[1fr_0.8fr] gap-10">
                 <div className="rounded-[32px] bg-[#f8fafc] p-8 border border-white">
                    <p className="manrope text-[11px] font-black uppercase tracking-[2.5px] text-slate-400 mb-4">{t("admin.detectedPattern")}</p>
                    <p className="text-[17px] font-medium leading-relaxed text-slate-700 italic">"{alert.pattern}"</p>
                 </div>
                 <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                       <p className="manrope text-[11px] font-black uppercase tracking-[2px] text-slate-400">Tactical Recommendation</p>
                       <p className="text-[16px] font-black text-slate-800 leading-snug">{alert.recommendation}</p>
                    </div>
                      <button
                       className="h-[64px] w-full rounded-[20px] bg-[#003f77] text-white manrope text-[14px] font-black uppercase tracking-[2px] shadow-lg shadow-blue-900/20 hover:bg-[#07569E] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-60"
                       disabled={Boolean(deployedByAlert[i])}
                       onClick={() => deployFieldUnit(i)}
                       
                      >
                        <Send className="h-5 w-5" /> {deployedByAlert[i] ? t('admin.operational') : t('admin.deployFieldUnit')}
                    </button>
                 </div>
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-slate-50 pt-8">
                 <div className="flex items-center gap-2 text-[14px] font-black text-red-600">
                    <Timer className="h-4 w-4" />
                    {t('admin.thresholdMsg', { days: alert.daysToCritical })}
                 </div>
                 <span className="manrope text-[11px] font-black uppercase tracking-[2px] text-slate-300">Analysis ID: AI-SEQ-{i+420}</span>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
         <div className="py-32 text-center rounded-[48px] border-2 border-dashed border-slate-100 bg-white shadow-sm">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-slate-50 text-slate-200">
               <Brain className="h-12 w-12" />
            </div>
            <h4 className="manrope text-[20px] font-black tracking-tight text-slate-400 uppercase tracking-[2px]">Neural Engine Standby</h4>
            <p className="mx-auto mt-3 max-w-xs text-[15px] font-bold text-slate-300 leading-relaxed">Execute pattern analysis to synchronize live operational data with predictive failure models.</p>
         </div>
      )}
    </div>
  );
}

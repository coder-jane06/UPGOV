import { callGemini, extractText, parseClaudeJson } from './ai';

/**
 * Runs predictive risk analysis combining real Open-Meteo weather data
 * with live ticket density.
 * 
 * @param {Array} tickets All current tickets from local storage
 * @param {string} sector The target sector to analyze (e.g. "Sector 36")
 * @returns {Object} { riskLevel, prediction, recommendation, confidence }
 */
export async function runPredictiveAnalysis(tickets, sector = "Sector 36") {
  try {
    // 1. Fetch real weather data for Greater Noida
    // Coordinates: 28.4744° N, 77.5040° E
    const weatherResponse = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=28.4744&longitude=77.5040&daily=precipitation_sum&forecast_days=3'
    );
    const weather = await weatherResponse.json();
    const rainForecast = weather?.daily?.precipitation_sum || [0, 0, 0];
    const totalRain = rainForecast.reduce((sum, val) => sum + (val || 0), 0);

    // 2. Fetch ticket data for the target sector
    const now = Date.now();
    const recentDrainageIssues = tickets.filter(t => 
      (t.location === sector || t.sector === sector) && 
      ['Sanitation', 'Roads & Potholes'].includes(t.category) &&
      t.status !== 'Resolved' &&
      new Date(t.filedAt || t.filed || t.date).getTime() > now - (7 * 24 * 60 * 60 * 1000)
    );

    // 3. Agent synthesis
    const agentPrompt = `Analyze environmental and civic risk for Greater Noida.
Sector: ${sector}
Rain forecast (mm, next 3 days): ${rainForecast.join(', ')} (Total: ${totalRain}mm)
Unresolved drainage/sanitation/roads tickets in this sector this week: ${recentDrainageIssues.length}

Assess waterlogging/infrastructure failure risk and recommend pre-emptive action.
Return ONLY valid JSON in this format:
{ 
  "riskLevel": "Critical"|"High"|"Medium"|"Low", 
  "prediction": "Detailed risk prediction string", 
  "recommendation": "Actionable recommendation string", 
  "confidence": 95 
}`;

    const response = await callGemini(
      "You are a predictive civic risk analyst. Combine environmental and complaint data to forecast infrastructure risks. Respond ONLY in valid JSON.",
      agentPrompt
    );

    const text = extractText(response);
    const parsed = parseClaudeJson(text);

    return {
      riskLevel: parsed.riskLevel || 'Medium',
      prediction: parsed.prediction || 'Unable to generate precise prediction.',
      recommendation: parsed.recommendation || 'Continue standard monitoring.',
      confidence: parsed.confidence || 50,
      sector: sector,
      weatherData: {
        rainForecast,
        totalRain
      },
      ticketDensity: recentDrainageIssues.length
    };
    
  } catch (err) {
    console.error('Predictive Analysis Error:', err);
    throw err;
  }
}

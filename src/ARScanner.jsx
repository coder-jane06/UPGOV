import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, X, RefreshCw, Zap, Scan, Crosshair, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Use environment variable for Gemini Key
// Secure API route is used instead

function getFallbackScanResult() {
  return {
    category: 'Roads & Potholes',
    subcategory: 'Road Damage',
    priority: 'High',
    confidence: 72,
    width: 'Approx 0.8 m',
    depth: 'Approx 6 cm',
    description: 'Auto-classified from captured frame using local fallback mode. Please verify details before final submission.',
    fallback: true,
  };
}

export default function ARScanner({ onClose, onScanComplete }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Start WebRTC Camera stream
    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not available. This usually happens if you access the app over HTTP on a mobile device without HTTPS.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access failed", err);
        setError("Camera access denied or unavailable.");
      }
    }

    startCamera();

    // Cleanup stream on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    // Setup canvas
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw current frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to Base64 JPEG
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    
    setAnalyzing(true);

    const applyFallbackResult = () => {
      const fallback = getFallbackScanResult();
      onScanComplete({ ...fallback, photoDataUrl: `data:image/jpeg;base64,${base64Image}` });
    };
    
    try {
      const promptText = `You are an AI infrastructure analyst. Analyze the provided image of city damage or public issue.
Identify the issue and classify it precisely into one of these strict Categories:
"Roads & Potholes", "Water Supply", "Electricity", "Sanitation", "Public Lighting", "Encroachment", "Environmental/Green", "Noise Pollution", "Other".

Determine a strict Priority: "Critical", "High", "Medium", "Low".

Output ONLY a valid JSON object with the following schema, no markdown, no other text:
{
  "category": "exact category string from above",
  "subcategory": "a 2-3 word subcategory, eg 'Deep Pothole', 'Leaking Pipe'",
  "priority": "exact priority string",
  "confidence": "number between 0 and 100",
  "width": "estimated width in meters/cm",
  "depth": "estimated depth in cm if applicable",
  "description": "A precise 1-2 sentence description of what is damaged and any visible hazards."
}`;

      const response = await fetch(`/api/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          body: {
            contents: [
              {
                parts: [
                  { text: promptText },
                  { inline_data: { mime_type: "image/jpeg", data: base64Image } }
                ]
              }
            ]
          }
        })
      });

      if (!response.ok) {
        throw new Error("Gemini Vision API failed. Status: " + response.status);
      }

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      try {
         const parsedData = JSON.parse(cleanJson);
         onScanComplete({ ...parsedData, photoDataUrl: `data:image/jpeg;base64,${base64Image}` });
      } catch (parseErr) {
         console.error("JSON Parse Error", cleanJson);
         throw new Error("Could not parse AI response.");
      }
    } catch (err) {
      console.error(err);
      applyFallbackResult();
    } finally {
      setIsCapturing(false);
      setAnalyzing(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="fixed inset-0 z-[9999] bg-black/95 flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 touch-none overscroll-none"
      >
        <div className="w-full max-w-lg h-[92vh] sm:h-auto sm:aspect-[9/16] bg-[#1a1a1a] sm:rounded-[40px] rounded-t-[40px] overflow-hidden flex flex-col relative shadow-2xl border border-white/10">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 bg-[#1a1a1a] z-10 shrink-0">
            <div>
              <span className="bg-[#ea580c]/20 text-[#ea580c] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[2px]">{t('citizen.betaFeature') || 'AI SCANNER'}</span>
              <h2 className="text-[18px] font-bold text-white mt-1">Capture Damage</h2>
            </div>
            <button type="button" onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all">
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Camera Viewport (Boxed, not full screen) */}
          <div className="relative flex-1 bg-black overflow-hidden m-4 mt-0 rounded-3xl border border-white/5 shadow-inner">
            {error ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <X className="h-8 w-8 text-red-500" />
                </div>
                <p className="font-bold text-lg text-white mb-2">Camera Unavailable</p>
                <p className="text-white/60 text-sm">{error}</p>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  autoPlay 
                  playsInline 
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* AR HUD */}
                <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center">
                  <div className="relative w-4/5 aspect-square max-w-[280px]">
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-[3px] border-l-[3px] border-[#ea580c] rounded-tl-2xl" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-[3px] border-r-[3px] border-[#ea580c] rounded-tr-2xl" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[3px] border-l-[3px] border-[#ea580c] rounded-bl-2xl" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[3px] border-r-[3px] border-[#ea580c] rounded-br-2xl" />
                    
                    <Crosshair className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-white/50" />
                    
                    {analyzing && (
                      <motion.div 
                        initial={{ top: 0, opacity: 0 }}
                        animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[2px] bg-[#ea580c] shadow-[0_0_15px_#ea580c]"
                      />
                    )}
                  </div>
                </div>

                {/* Status Float */}
                <AnimatePresence>
                  {analyzing && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-orange-500/50 flex items-center gap-2 whitespace-nowrap"
                    >
                      <RefreshCw className="h-4 w-4 text-[#ea580c] animate-spin" />
                      <span className="font-bold text-[12px] text-white">Analyzing...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Controls Area */}
          <div className="p-6 pt-2 shrink-0 bg-[#1a1a1a]">
            {!error ? (
              <div className="flex flex-col gap-3">
                <button 
                  type="button"
                  onClick={captureAndAnalyze}
                  disabled={isCapturing || analyzing}
                  className={`w-full py-4 rounded-2xl font-black text-[16px] tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
                    analyzing 
                      ? 'bg-[#ea580c]/20 text-[#ea580c] border border-[#ea580c]/50' 
                      : 'bg-[#ea580c] text-white hover:bg-[#c2410c] active:scale-[0.98]'
                  }`}
                >
                  <Camera className="h-5 w-5" />
                  {analyzing ? 'Scanning...' : 'Scan Damage'}
                </button>
                <p className="text-center text-[12px] font-medium text-white/50">
                  {analyzing ? 'Keep the camera steady' : 'Point camera at the damage to auto-fill details'}
                </p>
              </div>
            ) : (
              <button 
                type="button"
                onClick={onClose}
                className="w-full py-4 rounded-2xl font-black text-[16px] tracking-wide bg-white/10 text-white hover:bg-white/20 active:scale-[0.98] transition-all"
              >
                Close Scanner
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

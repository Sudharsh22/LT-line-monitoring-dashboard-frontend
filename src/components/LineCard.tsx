"use client";

import React from 'react';
import { useLiveStore } from '@/store/useLiveStore';
import { Activity, Zap, ShieldAlert, Cpu } from "lucide-react";
import { motion } from "framer-motion";

interface LineCardProps {
  lineId: string;
  name: string;
  thresholds: {
    voltage_min: number;
    voltage_max: number;
    current_max: number;
  };
}

export function LineCard({ lineId, name, thresholds }: LineCardProps) {
  // Use Line A metrics as Phase R, fall back to 0s
  const metrics = useLiveStore((s) => s.metrics[lineId]) || { 
    vt: 0, 
    ir: 0, 
    power: 0, 
    frequency: 0, 
    timestamp: new Date(),
    status: 'NORMAL',
    responder: null
  };
  
  const [stickyResponder, setStickyResponder] = React.useState<string | null>(null);
  
  // Keep the responder name visible for 10 seconds even if the fault clears
  React.useEffect(() => {
    if (metrics.status === 'FAULT' && metrics.responder) {
       setStickyResponder(metrics.responder);
       const timer = setTimeout(() => setStickyResponder(null), 10000);
       return () => clearTimeout(timer);
    }
  }, [metrics.status, metrics.responder]);

  const isFaulty = metrics.status === 'FAULT' || !!stickyResponder;
  
  return (
    <motion.div
      className={`border-2 p-6 bg-[#0f172a] transition-all duration-300 relative overflow-hidden ${
        isFaulty ? "border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.25)]" : "border-slate-800"
      }`}
    >
      {isFaulty && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-widest animate-pulse z-10">
           Dispatch Active
        </div>
      )}

      {/* Header: Industrial Look - Strictly Phase R */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded border ${isFaulty ? "bg-red-950 border-red-800" : "bg-slate-900 border-slate-700"}`}>
            <Cpu className={`w-5 h-5 ${isFaulty ? "text-red-500" : "text-slate-400"}`} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-white">
              PHASE R <span className="text-emerald-500 text-[10px] ml-2 animate-pulse">[SYSTEM LIVE]</span>
            </h3>
            {stickyResponder && (
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-0.5 animate-bounce">
                DISPATCHED: {stickyResponder}
              </p>
            )}
          </div>
        </div>
        <div className={`text-xs font-black px-3 py-1 rounded border tracking-widest ${
          isFaulty ? "bg-red-950 text-red-500 border-red-900 animate-pulse" : "bg-emerald-950/30 text-emerald-500 border-emerald-900/30"
        }`}>
          {isFaulty ? "FAULT ALERT" : "NOMINAL"}
        </div>
      </div>
      
      {/* Metric List: Exactly like the Sketch */}
      <div className="flex flex-col gap-6">
        <MetricRow label="Voltage" value={metrics.vt} unit="V" color={metrics.vt > thresholds.voltage_max ? "text-red-500" : "text-white"} />
        <MetricRow label="Current" value={metrics.ir} unit="A" color={metrics.ir > thresholds.current_max ? "text-red-500" : "text-white"} />
        <MetricRow label="Power" value={metrics.power} unit="W" />
      </div>

      {/* Auxiliary Info */}
      <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center">
        <div className="text-[10px] uppercase font-black text-slate-600 tracking-widest">
          Frequency: <span className="text-slate-400">{metrics.frequency.toFixed(2)} Hz</span>
        </div>
        <div className="text-[10px] uppercase font-black text-slate-600 tracking-widest">
          Status: <span className={isFaulty ? "text-red-500" : "text-emerald-500"}>{isFaulty ? "TRIPPED" : "HEALTHY"}</span>
        </div>
      </div>
    </motion.div>
  );
}

function MetricRow({ label, value, unit, color = "text-white" }: { label: string; value: number; unit: string, color?: string }) {
  return (
    <div className="flex justify-between items-center group border-l-4 border-transparent hover:border-slate-700 pl-4 transition-all">
      <span className="text-sm uppercase font-black text-slate-500 tracking-widest">
        {label} <span className="ml-2 opacity-20">=</span>
      </span>
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-black font-mono tracking-tighter ${color}`}>
          {value.toFixed(1)}
        </span>
        <span className="text-xs font-black text-slate-600 w-4">{unit}</span>
      </div>
    </div>
  );
}

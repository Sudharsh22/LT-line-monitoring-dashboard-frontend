"use client";

import React from 'react';
import { useLiveStore } from '@/store/useLiveStore';
import { motion, AnimatePresence } from "framer-motion";
import { ListFilter, ShieldAlert, History } from "lucide-react";

export function FaultLog() {
  const faults = useLiveStore((s) => s.faults);
  
  return (
    <aside className="border border-slate-800 bg-[#0f172a] flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-black/20">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
           <History className="w-3 h-3" /> System Fault Audit Log
        </h3>
        <span className="text-[8px] font-black px-1.5 py-0.5 bg-red-950 text-red-500 border border-red-900 rounded">
          LIVE
        </span>
      </div>
      
      <div className="flex flex-col overflow-y-auto p-4 gap-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {faults.length > 0 ? (
            faults.map((log) => (
              <motion.div
                key={log._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="border border-red-900/50 p-4 bg-red-950/10 relative group overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-px bg-red-500/50 animate-pulse" />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-100 uppercase tracking-tight">
                      {log.lineId.replace('_', ' ')}: <span className="text-red-500">{log.faultType}</span>
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">TIMING: {new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <ShieldAlert className="w-4 h-4 text-red-600 opacity-50" />
                </div>

                <div className="grid grid-cols-1 gap-1.5 pt-3 border-t border-slate-800/50">
                   <LogMetric label="Voltage" value={log.peakVoltage} unit="V" />
                   <LogMetric label="Current" value={log.peakCurrent} unit="A" />
                   <LogMetric label="Power" value={log.peakPower} unit="W" />
                </div>
                
                <div className="mt-3 py-1.5 px-2 bg-red-950/20 border-l-2 border-red-800">
                   <p className="text-[9px] text-red-400 font-bold leading-tight uppercase">
                     DIAGNOSTIC: {log.message}
                   </p>
                </div>

                {log.responderName && (
                  <div className="mt-2 flex items-center gap-2 bg-emerald-950/20 p-2 border border-emerald-900/40">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                      ✓ DISPATCHED: {log.responderName}
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center opacity-20">
              <ShieldAlert className="w-12 h-12 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-center">No Active Faults</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}

function LogMetric({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex justify-between items-center bg-white/2 px-2 py-1">
      <span className="text-[9px] uppercase font-bold text-slate-500">{label}</span>
      <span className="text-[10px] font-mono font-bold text-slate-300">{value.toFixed(1)} {unit}</span>
    </div>
  );
}

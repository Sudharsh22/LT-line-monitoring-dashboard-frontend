"use client";

import { useEffect, useRef, useState } from "react";
import React from "react";
import { 
  Wifi, 
  WifiOff, 
  Activity,
  Server,
  Database,
  Cpu,
  ShieldAlert
} from "lucide-react";
import { io } from "socket.io-client";
import axios from "axios";
import { useLiveStore } from "@/store/useLiveStore";
import { LineCard } from "@/components/LineCard";
import { TrendChart } from "@/components/TrendChart";
import { FaultLog } from "@/components/FaultLog";

const BACKEND_URL = "http://localhost:8000";

export default function Dashboard() {
  const { updateMetric, addFault, setLines, lines, connected, setConnected } = useLiveStore();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/lines`);
        setLines(res.data);
      } catch (err) {
        console.error("Failed to fetch lines config:", err);
      }
    };
    fetchConfig();

    socketRef.current = io(BACKEND_URL);

    socketRef.current.on("connect", () => {
      setConnected(true);
      console.log("✓ System Online");
    });

    socketRef.current.on("disconnect", () => {
      setConnected(false);
      console.log("✗ System Offline");
    });

    socketRef.current.on("live-update", (data: any) => {
      updateMetric(data.lineId, data);
    });

    socketRef.current.on("fault-event", (fault: any) => {
      addFault({
        ...fault,
        _id: fault._id || Date.now().toString(),
        timestamp: new Date(fault.timestamp),
        responderName: fault.responderName
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [updateMetric, addFault, setLines, setConnected]);

  // Primary Phase (R) is designated as 'line_a'
  const phaseR = lines.find(l => l.lineId === 'line_a') || { 
    lineId: 'line_a', 
    name: 'Phase R', 
    thresholds: { voltage_min: 180, voltage_max: 250, current_max: 35 } 
  };

  return (
    <main className="min-h-screen p-6 bg-[#020617] text-slate-100 font-sans selection:bg-slate-700">
      {/* Industrial Header */}
      <header className="border-b-2 border-slate-800 mb-8 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-slate-800 p-3 border border-slate-700">
            <Cpu className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
              LT-LINE FAULT DETECTION SYSTEM
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Control Station ID: CRT-501</span>
              <span className="h-1 w-1 bg-slate-700 rounded-full" />
              <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">Phase R Telemetry Link</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-6 mr-6 border-r border-slate-800 pr-6">
             <div className="flex items-center gap-2">
                <Database className="w-3 h-3 text-slate-600" />
                <span className="text-[9px] font-black uppercase text-slate-500">DB: <span className="text-slate-300">CONNECTED</span></span>
             </div>
             <div className="flex items-center gap-2">
                <Server className="w-3 h-3 text-slate-600" />
                <span className="text-[9px] font-black uppercase text-slate-500">Node: <span className="text-slate-300">STABLE</span></span>
             </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 border border-slate-800">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Link Status</span>
            <div className={`flex items-center gap-2 text-[10px] font-black ${connected ? "text-emerald-400" : "text-red-500"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-600"}`} />
              {connected ? "LIVE" : "DISCONNECTED"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="flex flex-col gap-10">
        
        {/* Top Section: Metrics and Log side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Phase R Data Card */}
          <div className="lg:col-span-8 flex flex-col gap-4">
             <div className="flex items-center gap-4 mb-2">
                <Activity className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Phase R Real-time Telemetry</h2>
                <div className="h-px flex-1 bg-slate-800/50" />
             </div>
             <LineCard 
               lineId={phaseR.lineId}
               name="Phase R" 
               thresholds={phaseR.thresholds}
             />
          </div>

          {/* Fault Log (Now integrated next to stats) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
             <div className="flex items-center gap-4 mb-2">
                <ShieldAlert className="w-3 h-3 text-slate-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Fault Audit Log</h2>
                <div className="h-px flex-1 bg-slate-800/50" />
             </div>
             <div className="h-[380px]">
               <FaultLog />
             </div>
          </div>
        </div>

        {/* Bottom Section: Large Graphs Stacked */}
        <div className="space-y-10 pt-4">
           <div className="flex items-center gap-4">
              <Activity className="w-4 h-4 text-slate-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Time-Series Performance Analysis</h2>
              <div className="h-px flex-1 bg-slate-800/50" />
           </div>

           <div className="grid grid-cols-1 gap-12">
             <TrendChart 
               lineId="line_a" 
               metric="vt" 
               title="Voltage Historical Graph" 
               unit="V" 
               color="#3b82f6" 
               yDomain={[0, 500]} 
               yTicks={[0, 100, 200, 300, 400, 500]}
             />
             <TrendChart 
               lineId="line_a" 
               metric="ir" 
               title="Current Historical Graph" 
               unit="A" 
               color="#f59e0b" 
               yDomain={[0, 50]} 
               yTicks={[0, 10, 20, 30, 40, 50]}
             />
             <TrendChart 
               lineId="line_a" 
               metric="power" 
               title="Power Historical Graph" 
               unit="W" 
               color="#10b981" 
               yDomain={[0, 8000]} 
               yTicks={[0, 2000, 4000, 6000, 8000]}
             />
           </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">
          Industrial Grid Protocol • Monitor Station CRT-501 • End-to-End Monitoring
        </p>
        <div className="flex items-center gap-8 text-[9px] font-black uppercase tracking-widest text-slate-500">
          <ClientTime />
          <span>System Status: Optimal</span>
          <span>© LT-Monitor Corp</span>
        </div>
      </footer>
    </main>
  );
}

function ClientTime() {
  const [time, setTime] = useState<string>("");
  
  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return <span>STATION TIME: {time || "--:--:--"}</span>;
}

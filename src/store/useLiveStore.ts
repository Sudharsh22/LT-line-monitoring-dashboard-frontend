import { create } from 'zustand';

export interface LineMetrics {
  lineId: string;
  vt: number;
  ir: number;
  power: number;
  frequency: number;
  timestamp: Date;
  status?: 'NORMAL' | 'FAULT';
  responder?: string | null;
}

export interface Fault {
  _id: string;
  lineId: string;
  faultType: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: Date;
  peakVoltage: number;
  peakCurrent: number;
  peakPower: number;
  peakFrequency: number;
  message: string;
  responderName?: string;
}

interface LiveStore {
  metrics: Record<string, LineMetrics>;
  faults: Fault[];
  lines: any[];
  connected: boolean;
  updateMetric: (lineId: string, data: Partial<LineMetrics>) => void;
  addFault: (fault: Fault) => void;
  setLines: (lines: any[]) => void;
  setConnected: (status: boolean) => void;
  clearOldFaults: () => void;
}

export const useLiveStore = create<LiveStore>((set) => ({
  metrics: {},
  faults: [],
  lines: [],
  connected: false,
  
  updateMetric: (lineId, data) =>
    set((state) => ({
      metrics: {
        ...state.metrics,
        [lineId]: { ...state.metrics[lineId], ...data, timestamp: data.timestamp || new Date() }
      }
    })),
  
  addFault: (fault) =>
    set((state) => ({
      faults: [fault, ...state.faults].slice(0, 50)  // Keep last 50
    })),
  
  setLines: (lines) => set({ lines }),
  setConnected: (status) => set({ connected: status }),
  
  clearOldFaults: () =>
    set((state) => ({
      faults: state.faults.filter(
        (f) => new Date(f.timestamp).getTime() > Date.now() - 24 * 3600000
      )
    }))
}));

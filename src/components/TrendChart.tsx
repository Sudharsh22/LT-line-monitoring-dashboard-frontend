"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
  Label
} from 'recharts';
import axios from 'axios';

interface TrendChartProps {
  lineId: string;
  metric: 'vt' | 'power' | 'ir';
  title: string;
  unit: string;
  color: string;
  yDomain?: [number, number];
  yTicks?: number[];
}

export function TrendChart({ lineId, metric, title, unit, color, yDomain, yTicks }: TrendChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Measure container dimensions directly — no ResponsiveContainer needed
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    };

    // Measure after layout settles
    const timer = setTimeout(measure, 100);

    // Re-measure on resize
    const observer = new ResizeObserver(() => measure());
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/trends/${lineId}`, {
          params: { hours: 6 }
        });
        
        const formatted = response.data.map((d: any) => ({
          time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          value: d[metric],
          label: metric === 'vt' ? 'vt' : metric === 'ir' ? 'ir' : 'power'
        }));
        
        if (formatted.length === 0) {
            setData([{ time: new Date().toLocaleTimeString(), value: 0, label: metric }]);
        } else {
            setData(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch trends:', error);
        setData([{ time: new Date().toLocaleTimeString(), value: 0, label: metric }]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrends();
    const interval = setInterval(fetchTrends, 30000);
    return () => clearInterval(interval);
  }, [lineId, metric]);
  
  return (
    <div className="border border-slate-800 bg-[#0f172a] p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
          {title}
        </h3>
        <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">Digital Sampling Active</span>
      </div>

      <div ref={containerRef} className="w-full" style={{ height: 320 }}>
        {dimensions && dimensions.width > 0 && (
          <AreaChart 
            width={dimensions.width} 
            height={dimensions.height} 
            data={data} 
            margin={{ top: 20, right: 30, left: 30, bottom: 40 }}
          >
            <CartesianGrid 
              strokeDasharray="none" 
              stroke="#1e293b" 
              vertical={false} 
              horizontalPoints={yTicks}
            />
            
            <XAxis 
              dataKey="time" 
              stroke="#475569" 
              fontSize={10} 
              tickLine={true} 
              axisLine={true}
              height={50}
              interval="preserveStartEnd"
              tick={{ fill: '#94a3b8', fontWeight: 'bold' }}
            >
              <Label value="TIMING" offset={-20} position="insideBottom" fill="#64748b" fontSize={11} fontWeight="black" />
            </XAxis>
            
            <YAxis 
              stroke="#475569" 
              fontSize={10} 
              tickLine={true} 
              axisLine={true}
              domain={yDomain || [0, 'auto']}
              ticks={yTicks}
              tick={{ fill: '#94a3b8', fontWeight: 'bold' }}
              width={50}
            >
              <Label 
                value={unit === 'V' ? 'VOLTS' : unit === 'A' ? 'AMPS' : 'WATTS'} 
                angle={-90} 
                position="insideLeft" 
                style={{ textAnchor: 'middle', fill: '#64748b', fontSize: 11, fontWeight: 'black' }} 
                offset={-10}
              />
            </YAxis>

            <Tooltip 
              contentStyle={{ 
                background: '#020617', 
                border: '2px solid #1e293b', 
                borderRadius: '2px', 
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
              itemStyle={{ color: color, fontWeight: 'black' }}
              labelStyle={{ color: '#64748b', marginBottom: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}
              formatter={(value: any) => [`${value} ${unit}`, `${metric} =`]}
              cursor={{ stroke: '#334155', strokeWidth: 2 }}
            />

            <Area
              type="stepAfter"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill={color}
              fillOpacity={0.1}
              isAnimationActive={false}
            />
          </AreaChart>
        )}
      </div>
    </div>
  );
}

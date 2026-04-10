"use client";

import React from 'react';

interface GaugeProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  danger?: (v: number) => boolean;
}

export function Gauge({ label, value, unit, min, max, danger }: GaugeProps) {
  // Normalize value between min and max for the 0-100 percentage
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const isDanger = danger?.(value);
  
  return (
    <div className="flex flex-col items-center space-y-2">
      {/* SVG Gauge */}
      <div className="relative w-24 h-24">
        <svg width="100%" height="100%" viewBox="0 0 120 120" className="drop-shadow-sm">
          {/* Background circle */}
          <circle 
            cx="60" 
            cy="60" 
            r="50" 
            fill="none" 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="8" 
          />
          
          {/* Progress arc (0–360° actually here, we'll use stroke-dasharray) */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={isDanger ? '#ef4444' : '#06b6d4'}
            strokeWidth="8"
            strokeDasharray={`${(percent / 100) * 314} 314`}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{ 
              transform: 'rotate(-90deg)', 
              transformOrigin: '50% 50%',
              filter: isDanger ? 'drop-shadow(0 0 4px #ef4444)' : 'drop-shadow(0 0 4px #06b6d4)'
            }}
          />
          
          {/* Value text */}
          <text
            x="60"
            y="65"
            textAnchor="middle"
            fontSize="22"
            fontWeight="bold"
            fill="#fff"
            className="font-mono"
          >
            {value.toFixed(1)}
          </text>
          <text
            x="60"
            y="82"
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill="#6b7280"
            className="uppercase tracking-tighter"
          >
            {unit}
          </text>
        </svg>
      </div>
      
      {/* Label */}
      <div className="text-center">
        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">{label}</p>
      </div>
    </div>
  );
}

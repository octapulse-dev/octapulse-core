'use client';

import React from 'react';

export function SimpleBarChart({
  data,
  width = 480,
  height = 180,
  label = ''
}: {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  label?: string;
}) {
  const padding = 24;
  const barGap = 8;
  const maxVal = Math.max(1, ...data.map(d => d.value));
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const barW = Math.max(4, (innerW - barGap * (data.length - 1)) / data.length);

  return (
    <svg width={width} height={height} className="w-full">
      <rect x={0} y={0} width={width} height={height} fill="#ffffff" stroke="#e5e7eb" />
      {data.map((d, i) => {
        const h = (d.value / maxVal) * innerH;
        const x = padding + i * (barW + barGap);
        const y = height - padding - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} fill="#000" />
            <text x={x + barW / 2} y={height - padding + 14} textAnchor="middle" fontSize="10" fill="#525252">
              {d.label}
            </text>
          </g>
        );
      })}
      {label && (
        <text x={padding} y={padding - 8} fontSize="12" fontWeight={600} fill="#111827">
          {label}
        </text>
      )}
    </svg>
  );
}

export function RGBBubblePlot({
  points,
  width = 480,
  height = 220,
  label = ''
}: {
  points: { r: number; g: number; b: number; size: number }[];
  width?: number;
  height?: number;
  label?: string;
}) {
  // Map R,G,B to x axis buckets and y positions; bubble size reflects intensity or coverage
  const padding = 24;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const maxSize = Math.max(1, ...points.map(p => p.size));

  const axis = ['R', 'G', 'B'];
  const xFor = (channel: 'R' | 'G' | 'B') => {
    const idx = axis.indexOf(channel);
    return padding + (innerW / (axis.length - 1)) * idx;
  };

  return (
    <svg width={width} height={height} className="w-full">
      <rect x={0} y={0} width={width} height={height} fill="#ffffff" stroke="#e5e7eb" />
      {/* Axes */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#9ca3af" />
      {axis.map((c, i) => (
        <text key={i} x={xFor(c as any)} y={height - padding + 14} textAnchor="middle" fontSize="10" fill="#525252">{c}</text>
      ))}
      {/* Points */}
      {points.map((p, i) => {
        const x = xFor(['R', 'G', 'B'][i % 3] as any);
        const y = padding + (innerH * (1 - (i % 5) / 4));
        const r = 6 + (p.size / maxSize) * 18;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={`rgb(${p.r}, ${p.g}, ${p.b})`} stroke="#111827" strokeOpacity={0.25} />
          </g>
        );
      })}
      {label && (
        <text x={padding} y={padding - 8} fontSize="12" fontWeight={600} fill="#111827">
          {label}
        </text>
      )}
    </svg>
  );
}

export function CorrelationHeatmap({
  matrix,
  labels,
  size = 280,
  label = ''
}: {
  matrix: number[][]; // -1..1
  labels: string[];
  size?: number;
  label?: string;
}) {
  const n = matrix.length;
  const cell = Math.max(14, Math.floor((size - 60) / n));
  const pad = 40;
  const totalW = pad + n * cell + 20;
  const totalH = pad + n * cell + 20;
  const color = (v: number) => {
    // grayscale map: 0 = white, 1 = black by |v|
    const t = Math.max(0, Math.min(1, Math.abs(v)));
    const c = Math.round(255 * (1 - t));
    return `rgb(${c},${c},${c})`;
  };

  return (
    <svg width={totalW} height={totalH} className="w-full">
      <rect x={0} y={0} width={totalW} height={totalH} fill="#ffffff" stroke="#e5e7eb" />
      {matrix.map((row, i) => (
        row.map((v, j) => (
          <rect key={`${i}-${j}`} x={pad + j * cell} y={pad + i * cell} width={cell} height={cell} fill={color(v)} stroke="#f3f4f6" />
        ))
      ))}
      {labels.map((l, i) => (
        <text key={`x-${i}`} x={pad + i * cell + cell / 2} y={pad - 6} textAnchor="middle" fontSize="9" fill="#525252">{l}</text>
      ))}
      {labels.map((l, i) => (
        <text key={`y-${i}`} x={pad - 6} y={pad + i * cell + cell / 2} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="#525252">{l}</text>
      ))}
      {label && (
        <text x={8} y={14} fontSize="12" fontWeight={600} fill="#111827">{label}</text>
      )}
    </svg>
  );
}



import React, { useState, useEffect } from 'react';

function getRemaining(target) {
  const diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return [
    { label: 'Days', value: d },
    { label: 'Hours', value: h },
    { label: 'Mins', value: m },
    { label: 'Secs', value: s },
  ];
}

export default function CountdownTimer({ targetLabel = 'Sale Ends In', targetDate, light = false }) {
  const [target] = useState(() => targetDate || new Date(Date.now() + 72 * 3600000));
  const [units, setUnits] = useState(() => getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setUnits(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const box = light
    ? 'bg-black/25 border-white/25 text-white'
    : 'bg-white border-gray-100 text-ink';
  const labelCls = light ? 'text-white/80' : 'text-gray-500';

  return (
    <div>
      <p className={`text-[10px] font-extrabold uppercase tracking-[0.16em] mb-2 ${labelCls}`}>
        {targetLabel}
      </p>
      <div className="flex items-center gap-2">
        {units.map((u) => (
          <div key={u.label} className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shadow-soft ${box}`}>
            <span className="text-lg font-extrabold tabular-nums leading-none">{String(u.value).padStart(2,'0')}</span>
            <span className="text-[9px] font-bold uppercase tracking-wide opacity-70 mt-0.5">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

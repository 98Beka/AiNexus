import React from 'react';

type FinishedBannerProps = {
  reason: string;
};

// ── Компонент Баннера ───────────────────────────────────────────
export function FinishedBanner({ reason }: FinishedBannerProps) {
  return (
    <div style={s.wrap}>
      <div style={s.icon}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#b91c1c"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <p style={s.title}>Тест завершён</p>
        <p style={s.sub}>{reason}</p>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 12,
    padding: '12px 16px',
    width: '100%',
    maxWidth: 680,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14, fontWeight: 700, color: '#991b1b' },
  sub: { fontSize: 12, color: '#b91c1c' },
};
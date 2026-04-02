import { CircularProgress } from '@mui/material';

export type FinishReason = 'banned' | 'timeout' | 'manual';

interface FinishModalProps {
  reason: FinishReason;
  isSubmitting?: boolean;
}

const CONTENT: Record<FinishReason, {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  badgeBg: string;
  badgeColor: string;
  badgeText: string;
}> = {
  banned: {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    title: 'Тест прерван',
    subtitle: 'Лицо не было обнаружено 3 раза подряд. Тест завершён автоматически системой прокторинга.',
    badgeBg: '#fef2f2',
    badgeColor: '#b91c1c',
    badgeText: 'Нарушение правил',
  },
  timeout: {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    title: 'Время вышло',
    subtitle: 'Отведённое время на тест закончилось. Ваши ответы сохранены и отправлены.',
    badgeBg: '#fffbeb',
    badgeColor: '#92400e',
    badgeText: 'Время истекло',
  },
  manual: {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    title: 'Тест завершён',
    subtitle: 'Вы завершили тест досрочно. Ваши ответы сохранены и отправлены на проверку.',
    badgeBg: '#f0fdf4',
    badgeColor: '#15803d',
    badgeText: 'Отправлено',
  },
};

export function FinishModal({ reason, isSubmitting = false }: FinishModalProps) {
  const c = CONTENT[reason];

  return (
    <div style={mo.overlay}>
      <div style={mo.card}>

        <div style={{ ...mo.iconWrap, background: c.iconBg, color: c.iconColor }}>
          {c.icon}
        </div>

        <span style={{ ...mo.badge, background: c.badgeBg, color: c.badgeColor }}>
          {c.badgeText}
        </span>

        <h2 style={mo.title}>{c.title}</h2>
        <p style={mo.subtitle}>{c.subtitle}</p>

        <div style={mo.divider} />

        <div style={mo.statusRow}>
          {isSubmitting ? (
            <>
              <CircularProgress size={14} sx={{ color: '#6b7280' }} />
              <span style={mo.statusText}>Отправляем результаты...</span>
            </>
          ) : (
            <>
              <div style={{ ...mo.dot, background: reason === 'banned' ? '#ef4444' : '#22c55e' }} />
              <span style={mo.statusText}>
                {reason === 'banned' ? 'Тест аннулирован' : 'Результаты отправлены'}
              </span>
            </>
          )}
        </div>

        {reason === 'banned' && (
          <p style={mo.note}>
            Обратитесь к организатору тестирования, если считаете это ошибкой.
          </p>
        )}
      </div>
    </div>
  );
}

const mo: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 2000,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16, backdropFilter: 'blur(6px)',
  },
  card: {
    background: '#fff', borderRadius: 20, padding: '32px 28px',
    maxWidth: 400, width: '100%',
    boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    fontFamily: "'Inter','Geist',sans-serif",
    animation: 'fadeUp 0.3s ease',
  },
  iconWrap: {
    width: 60, height: 60, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    fontSize: 11, fontWeight: 700,
    padding: '4px 12px', borderRadius: 999,
    letterSpacing: '0.04em',
  },
  title: {
    fontSize: 22, fontWeight: 800,
    color: '#111827', letterSpacing: '-0.02em',
    margin: 0, textAlign: 'center',
  },
  subtitle: {
    fontSize: 13, color: '#6b7280',
    textAlign: 'center', lineHeight: 1.6, margin: 0,
  },
  divider: {
    width: '100%', height: 1,
    background: '#f3f4f6', margin: '4px 0',
  },
  statusRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f9fafb', borderRadius: 10,
    padding: '10px 16px', width: '100%',
  },
  dot: {
    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
  },
  statusText: {
    fontSize: 12, color: '#6b7280', fontWeight: 500,
  },
  btn: {
    width: '100%', height: 46, borderRadius: 12,
    border: '1.5px solid #e5e7eb', background: '#fff',
    color: '#374151', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'background 0.15s',
  },
  note: {
    fontSize: 11, color: '#9ca3af',
    textAlign: 'center', margin: 0, lineHeight: 1.5,
  },
};
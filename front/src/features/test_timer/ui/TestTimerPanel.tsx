import React from 'react';
import { useTestTimer } from '../model/useTestTimer';
import { formatTime } from '../lib/formatTime';

interface TestTimerPanelProps {
  duration: number;
  isActive: boolean;
  isFinished: boolean;
  onTimeUp: () => void;
  onManualFinish: () => void;
  style?: React.CSSProperties; // Для передачи внешних стилей позиционирования
}

export const TestTimerPanel: React.FC<TestTimerPanelProps> = ({
  duration,
  isActive,
  isFinished,
  onTimeUp,
  onManualFinish,
  style,
}) => {
  const { timeLeft } = useTestTimer({ duration, isActive, onTimeUp });

  const timerPct = (timeLeft / duration) * 100;
  const timerUrgent = timeLeft <= 60;
  const timerWarning = timeLeft <= 180;
  const timerColor = timerUrgent ? '#ef4444' : timerWarning ? '#f59e0b' : '#22c55e';
  const timerTextColor = timerUrgent ? '#b91c1c' : timerWarning ? '#92400e' : '#111827';

  return (
    <div style={{
      ...s.timerPanel,
      background: timerUrgent ? '#fff5f5' : timerWarning ? '#fffdf0' : '#fff',
      borderRightColor: timerUrgent ? '#fecaca' : timerWarning ? '#fde68a' : '#f3f4f6',
      ...style
    }}>
      <div style={s.timerTop}>
        <span style={s.timerHeading}>Осталось</span>

        {/* Big time display */}
        <div style={{
          ...s.timerDisplay,
          color: timerTextColor,
          animation: timerUrgent ? 'pulse 1s ease-in-out infinite' : 'none',
        }}>
          {formatTime(timeLeft)}
        </div>

        {/* Progress bar */}
        <div style={s.timerTrack}>
          <div style={{
            ...s.timerFill,
            width: `${timerPct}%`,
            background: timerColor,
            transition: 'width 1s linear, background 0.5s',
          }}/>
        </div>

        {/* Status label */}
        <div style={{
          ...s.timerBadge,
          background: timerUrgent ? '#fee2e2' : timerWarning ? '#fef9c3' : '#f0fdf4',
          color: timerTextColor,
        }}>
          <span style={{ ...s.timerBadgeDot, background: timerColor, animation: timerUrgent ? 'pulse 1s ease-in-out infinite' : 'none' }}/>
          {timerUrgent ? 'Заканчивается!' : timerWarning ? 'Скоро конец' : 'Идёт тест'}
        </div>
      </div>

      {/* Finish button */}
      <button
        style={s.finishBtn}
        onClick={onManualFinish}
        disabled={isFinished}
      >
        Завершить тест
      </button>
    </div>
  );
};

// Стили вынесены локально для фичи
const s: Record<string, React.CSSProperties> = {
  timerPanel: {
    width: 200, flexShrink: 0, borderRight: '1px solid',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    padding: '28px 16px 20px', transition: 'background 0.5s, border-color 0.5s',
  },
  timerTop:     { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  timerHeading: { fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' },
  timerDisplay: { fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  ringIcon:     { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  timerTrack:   { width: '100%', height: 5, borderRadius: 99, background: '#f3f4f6', overflow: 'hidden' },
  timerFill:    { height: '100%', borderRadius: 99 },
  timerBadge:   { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600 },
  timerBadgeDot:{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  finishBtn:    {
    width: '100%', height: 38, borderRadius: 10, border: '1.5px solid #e5e7eb',
    background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
    justifyContent: 'center', transition: 'border-color 0.15s, color 0.15s',
  },
};
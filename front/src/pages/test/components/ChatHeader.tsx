import React from 'react';

// Стили, относящиеся только к этому компоненту, инкапсулированы здесь.
// Для более крупных проектов их можно вынести в отдельный styles.ts или использовать CSS-in-JS/CSS Modules.
const s: Record<string, React.CSSProperties> = {
  header: { 
    padding: '14px 24px', 
    borderBottom: '1px solid #f3f4f6', 
    background: '#fff', 
    display: 'flex', 
    alignItems: 'center',
    // flexShrink: 0 нужен, чтобы шапка не сжималась, когда контент в чате растет.
    flexShrink: 0, 
  },
  headerLeft: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 8 
  },
  headerDot: { 
    width: 8, 
    height: 8, 
    borderRadius: '50%' 
  },
  headerTitle: { 
    fontSize: 15, 
    fontWeight: 700,
    color: '#111827',
  },
};

// Определяем интерфейс для пропсов, чтобы сделать компонент строго типизированным.
interface ChatHeaderProps {
  /**
   * Флаг, указывающий, завершен ли тест.
   * Влияет на цвет индикатора состояния.
   */
  isFinished: boolean;
}

/**
 * Компонент шапки чата для страницы теста.
 * Отображает заголовок и индикатор состояния (активен/завершен).
 */
export function ChatHeader({ isFinished }: ChatHeaderProps) {
  return (
    <header style={s.header}>
      <div style={s.headerLeft}>
        <div 
          style={{ 
            ...s.headerDot, 
            // Условное применение цвета фона в зависимости от состояния теста
            background: isFinished ? '#ef4444' /* red-500 */ : '#22c55e' /* green-500 */ 
          }} 
        />
        <span style={s.headerTitle}>AI Интервью</span>
      </div>
    </header>
  );
}
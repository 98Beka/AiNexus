import { useState, useEffect, useRef, useCallback } from 'react';
import { CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useParams } from 'react-router-dom';
import { styles as s } from './styles';
import { useGetAccessTokenQuery } from '@/entities/chat/api/chatApi';
import { useChatStream } from '@/features/chat/lib/useChatStream';
import { TestTimerPanel } from '@/features/test_timer';
import { CameraPopup } from '@/features/camera';
import { IntroModal } from './components/IntroModal/IntroModal';
import { FinishedBanner } from './components/FinishedBanner/FinishedBanner';
import { finishTest, initializeTest } from '@/features/test/api';
import { useDispatch } from 'react-redux';
import { setAccessToken } from '@/entities/session/model/slice';

const TIMER_DURATION = 10 * 60;

export default function TestPage() {
  const [input, setInput] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finishReason, setFinishReason] = useState('');
  const isFinishedRef = useRef(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  const { token } = useParams<{ token: string }>();
  const { data: access_token, isLoading: isAuthLoading, isError } = useGetAccessTokenQuery(token as any, { skip: !token });
  const dispatch = useDispatch();
  dispatch(setAccessToken(access_token))
  const { messages, currentStream, isStreaming, sendMessage } = useChatStream(access_token);

  // Auto-scroll
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, currentStream]);

  // Textarea height
  useEffect(() => {
    const el = textareaRef.current; if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [input]);

  // Камера для модалки (превью)
  useEffect(() => {
    if (!showIntro) return;
    navigator.mediaDevices.getUserMedia({ video: true }).then(s => {
      if (modalVideoRef.current) modalVideoRef.current.srcObject = s;
    }).catch(() => { });
  }, [showIntro]);

  const handleFinish = useCallback(async (reason: string) => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsFinished(true);
    setFinishReason(reason);
    try {
      await finishTest(access_token)
    } catch { /* silent */ }
  }, [access_token]);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await initializeTest(access_token)
      setShowIntro(false);
    } catch {

    }
    setIsStarting(false);
  };

  const handleSend = () => {
    if (!input.trim() || isStreaming || isFinished) return;
    sendMessage(input);
    setInput('');
  };

  if (isAuthLoading) return <div style={s.centered}><CircularProgress sx={{ color: '#111827' }} /></div>;
  if (isError || !access_token) return <div style={s.centered}><p style={{ color: '#ef4444' }}>Ошибка авторизации.</p></div>;

  return (
    <div style={s.root}>
      <style>{`
        @keyframes recBlink { 50% { opacity: 0.15 } }
        @keyframes cursorBlink { 50% { opacity: 0 } }
        textarea:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
      `}</style>

      {showIntro && (
        <IntroModal
          onStart={handleStart}
          isStarting={isStarting}
        />
      )}

      <div style={s.layout}>
        {!showIntro && (
          <TestTimerPanel
            duration={TIMER_DURATION}
            isActive={!isFinished}
            isFinished={isFinished}
            onTimeUp={() => handleFinish('Время вышло. Тест завершён автоматически.')}
            onManualFinish={() => handleFinish('Тест завершён вручную.')}
          />
        )}

        <div style={s.chatWrapper}>
          <div style={s.header}>
            <div style={s.headerLeft}>
              <div style={{ ...s.headerDot, background: isFinished ? '#ef4444' : '#22c55e' }} />
              <span style={s.headerTitle}>AI Интервью</span>
            </div>
          </div>

          <div style={s.messagesArea}>
            <div style={s.messagesInner}>
              {messages.map((msg, i) => (
                <div key={i} style={{ ...s.messageRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role !== 'user' && <div style={s.aiAvatar}>AI</div>}
                  <div style={msg.role === 'user' ? s.userBubble : s.aiBubble}>{msg.content}</div>
                </div>
              ))}
              {currentStream && (
                <div style={s.messageRow}>
                  <div style={s.aiAvatar}>AI</div>
                  <div style={s.aiBubble}>{currentStream}<span style={s.cursor} /></div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>
          </div>

          <div style={s.inputArea}>
            {isFinished && <FinishedBanner reason={finishReason} />}
            <div style={{ ...s.inputBox, opacity: isFinished ? 0.5 : 1 }}>
              <textarea
                ref={textareaRef}
                style={s.textarea}
                placeholder={isFinished ? 'Тест завершён' : 'Введите ответ...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                disabled={isStreaming || isFinished}
                rows={1}
              />
              <button onClick={handleSend} disabled={!input.trim() || isStreaming || isFinished} style={s.sendBtn}>
                {isStreaming ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SendIcon sx={{ fontSize: 15 }} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ФИЧА КАМЕРЫ: Инкапсулирует логику слежения, драг-н-дроп и интервалы */}
      {!showIntro && (
        <CameraPopup
          isActive={!isFinished}
          onCriticalFail={handleFinish}
        />
      )}
    </div>
  );
}
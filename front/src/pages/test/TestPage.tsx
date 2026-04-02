import { useState, useEffect, useRef, useCallback } from 'react';
import { CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { styles as s } from './styles';
import { useGetAccessTokenQuery } from '@/entities/chat/api/chatApi';
import { TestTimerPanel } from '@/features/test_timer';
import { CameraPopup } from '@/features/camera';
import { IntroModal } from './components/IntroModal/IntroModal';
import { finishTest, initializeTest } from '@/features/test/api';
import { useDispatch } from 'react-redux';
import { setAccessToken, setSessionId } from '@/entities/session/model/slice';
import { ChatWindow } from '@/features/chat/ui/ChatWindow';

const TIMER_DURATION = 10 * 60;

export default function TestPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const isFinishedRef = useRef(false);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  const { token } = useParams<{ token: string }>();
  const { data: access_token, isLoading: isAuthLoading, isError } = useGetAccessTokenQuery(token as any, { skip: !token });
  const dispatch = useDispatch();
  dispatch(setAccessToken(access_token))
  const sessionId = useRef<string>(crypto.randomUUID());
  dispatch(setSessionId(sessionId.current))

  // Камера для модалки (превью)
  useEffect(() => {
    if (!showIntro) return;
    navigator.mediaDevices.getUserMedia({ video: true }).then(s => {
      if (modalVideoRef.current) modalVideoRef.current.srcObject = s;
    }).catch(() => { });
  }, [showIntro]);

  const handleFinish = useCallback(async () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsFinished(true);
    try {
      await finishTest(access_token)
    } catch { /* silent */ }
  }, [access_token]);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await initializeTest(access_token, sessionId.current)
      setShowIntro(false);
    } catch {

    }
    setIsStarting(false);
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
            onTimeUp={() => handleFinish()}
            onManualFinish={() => handleFinish()}
          />
        )}

        <ChatWindow/>
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
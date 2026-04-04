import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { styles as s } from './styles';
import { TestTimerPanel } from '@/features/test_timer';
import { CameraPopup } from '@/features/camera';
import { IntroModal } from './components/IntroModal/IntroModal';
import { FinishModal, type FinishReason } from "@/features/modals/finish-modal"
import { finishTest, initializeTest } from '@/entities/test/api';
import { useDispatch, useSelector } from 'react-redux';
import { setAccessToken, setSessionId } from '@/entities/session/model/slice';
import { ChatWindow } from '@/features/chat/ui/ChatWindow';
import { generateId } from '@/shared/utils/const';
import { initChatStream } from '@/features/chat/model/chatThunks';
import type { AppDispatch, RootState } from '@/app/store';
import type { ApplicantShortDto } from '@/entities/applicant/type';
import { fetchMyInfo } from '@/entities/applicant/applicantApi';
import { fetchChatAccessToken } from '@/entities/chat/api/chatApi';

const TIMER_DURATION = 5 * 60;

export default function TestPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finishReason, setFinishReason] = useState<FinishReason>('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const isFinishedRef = useRef(false);
  const [me, setMe] = useState<ApplicantShortDto>()
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      const accessToken = await fetchChatAccessToken(token);
      dispatch(setAccessToken(accessToken));
    };

    const sessionId = generateId();
    dispatch(setSessionId(sessionId));

    load();
  }, [token, dispatch]);

  const accessToken = useSelector((state: RootState) => state.session.accessToken);
  const sessionId = useSelector((state: RootState) => state.session.sessionId);

  const handleFinish = useCallback(async (reason: FinishReason) => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsFinished(true);
    setFinishReason(reason);
    setShowFinishModal(true);
    setIsSubmitting(true);
    try {
      finishTest(accessToken ?? "");
    } catch {
      setIsSubmitting(false);
    }
    finally {
      setIsSubmitting(false);
    }
  }, [accessToken]);

  const handleStart = async () => {
    const me = await fetchMyInfo(accessToken)
    setMe(me)
    dispatch(setAccessToken(accessToken));
    dispatch(initChatStream())
    setIsStarting(true);
    try {
      const success = await initializeTest(accessToken, sessionId);
      if (!success) {
        setFinishReason('taken');
        setShowFinishModal(true);
        setShowIntro(false);
      } else {
        setShowIntro(false);
      }
    } catch { }
    setIsStarting(false);
  };

  return (
    <div style={s.root}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
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

      {showFinishModal && (
        <FinishModal
          reason={finishReason}
          isSubmitting={isSubmitting}
        />
      )}

      <div style={s.layout}>
        {!showIntro && (
          <TestTimerPanel
            duration={TIMER_DURATION}
            isActive={!isFinished}
            isFinished={isFinished}
            onTimeUp={() => handleFinish('timeout')}
            onManualFinish={() => handleFinish('manual')}
          />
        )}

        <ChatWindow preview={me?.preview ?? ""}  userPhoto={me?.photo ?? ""}/>
      </div>

      {!showIntro && (
        <CameraPopup
          isActive={!isFinished}
          onCriticalFail={() => handleFinish('banned')}
        />
      )}
    </div>
  );
}
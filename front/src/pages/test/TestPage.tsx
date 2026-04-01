import { useState, useEffect, useRef, useCallback } from 'react';
import { CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { useGetAccessTokenQuery } from '@/entities/chat/api/chatApi';
import { useChatStream } from '@/features/chat/lib/useChatStream';
import { useParams } from 'react-router-dom';

type FaceStatus = 'idle' | 'checking' | 'ok' | 'no_face' | 'error';
type CamCheck   = 'idle' | 'checking' | 'ok' | 'fail';

const FACE_STATUS: Record<FaceStatus, { label: string; dot: string }> = {
  idle:     { label: 'Ожидание',         dot: '#6b7280' },
  checking: { label: 'Ожидание',         dot: '#6b7280' },
  ok:       { label: 'Лицо найдено',    dot: '#22c55e' },
  no_face:  { label: 'Лицо не найдено', dot: '#ef4444' },
  error:    { label: 'Ошибка',           dot: '#ef4444' },
};

const CAM_SIZES    = [160, 220, 300, 450];
const TIMER_DURATION = 10 * 60; // 600 seconds

function captureFrameBase64(video: HTMLVideoElement, canvas: HTMLCanvasElement): string {
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d')!.drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export const detectFace = async (photo: string, token: string) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/proctoring/comparison_faces`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ photo }),
    }
  )

  if (!res.ok) {
    throw new Error('Failed to detect face')
  }

  return res.json()
}

// ── Intro Modal with camera check ─────────────────────────────────────────────
function IntroModal({
  onStart, isStarting,
  videoRef, canvasRef,
  camCheck, onCheckCam,
}: {
  onStart: () => void;
  isStarting: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  camCheck: CamCheck;
  onCheckCam: () => void;
}) {
  const camOk = camCheck === 'ok';

  return (
    <div style={mo.overlay}>
      <div style={mo.card}>
        {/* Icon */}
        <div style={mo.iconWrap}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>

        <h2 style={mo.title}>AI Интервью</h2>
        <p style={mo.sub}>Добро пожаловать! Ознакомьтесь с условиями перед началом</p>

        {/* Info rows */}
        <div style={mo.infoBlock}>
          {[
            { icon: '⏱', text: 'Длительность теста — 10 минут' },
            { icon: '📷', text: 'Камера должна быть включена на протяжении всего теста' },
            { icon: '👤', text: 'Ваше лицо должно быть чётко видно на камере' },
            { icon: '🚫', text: 'При 3 нарушениях подряд тест завершится автоматически' },
          ].map(({ icon, text }) => (
            <div key={text} style={mo.infoRow}>
              <span style={mo.infoIcon}>{icon}</span>
              <span style={mo.infoText}>{text}</span>
            </div>
          ))}
        </div>

        {/* Camera check section */}
        <div style={mo.camSection}>
          <p style={mo.camTitle}>Проверка камеры</p>

          {/* Video preview */}
          <div style={mo.videoWrap}>
            <video ref={videoRef} autoPlay playsInline muted style={mo.video} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Status overlay */}
            {camCheck !== 'idle' && (
              <div style={{
                ...mo.camOverlay,
                background: camCheck === 'ok'
                  ? 'rgba(34,197,94,0.15)'
                  : camCheck === 'fail'
                  ? 'rgba(239,68,68,0.15)'
                  : 'rgba(0,0,0,0.3)',
              }}>
                {camCheck === 'checking' && <CircularProgress size={24} sx={{ color: '#fff' }} />}
                {camCheck === 'ok' && (
                  <div style={mo.camBadgeOk}>
                    <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Камера готова
                  </div>
                )}
                {camCheck === 'fail' && (
                  <div style={mo.camBadgeFail}>
                    ОШИБКА
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Check button */}
          <button
            style={{
              ...mo.checkBtn,
              opacity: camCheck === 'checking' ? 0.6 : 1,
              background: camOk ? '#f0fdf4' : '#f9fafb',
              border: `1.5px solid ${camOk ? '#bbf7d0' : '#e5e7eb'}`,
              color: camOk ? '#15803d' : '#374151',
            }}
            onClick={onCheckCam}
            disabled={camCheck === 'checking'}
          >
            {camCheck === 'checking' && <CircularProgress size={12} sx={{ color: '#6b7280' }} />}
            {camCheck === 'ok'       && <span style={{ color: '#22c55e' }}>✓</span>}
            {camCheck === 'fail'     && <span style={{ color: '#ef4444' }}>✕</span>}
            {camCheck === 'idle'     && '📷'}
            {camCheck === 'checking' ? 'Проверка...'
              : camCheck === 'ok'   ? 'Проверка пройдена'
              : camCheck === 'fail' ? 'Повторить проверку'
              : 'Проверить камеру'}
          </button>
        </div>

        {/* Start button */}
        <button
          style={{
            ...mo.btn,
            opacity: (!camOk || isStarting) ? 0.45 : 1,
            cursor: (!camOk || isStarting) ? 'not-allowed' : 'pointer',
          }}
          onClick={onStart}
          //disabled={!camOk || isStarting}
        >
          {isStarting
            ? <><CircularProgress size={14} sx={{ color: '#fff' }} /> Запуск...</>
            : 'Начать тест →'}
        </button>

        <p style={mo.note}>Нажимая кнопку, вы соглашаетесь с условиями прохождения</p>
      </div>
    </div>
  );
}

const mo: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 2000,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16, backdropFilter: 'blur(6px)',
  },
  card: {
    background: '#fff', borderRadius: 20, padding: '32px 28px',
    maxWidth: 460, width: '100%', maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
    animation: 'fadeUp 0.3s ease',
    fontFamily: "'Inter','Geist',sans-serif",
  },
  iconWrap: {
    width: 56, height: 56, borderRadius: '50%',
    background: '#f9fafb', border: '1.5px solid #e5e7eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title:    { fontSize: 20, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', margin: 0 },
  sub:      { fontSize: 13, color: '#6b7280', textAlign: 'center', margin: 0 },
  infoBlock: {
    width: '100%', background: '#f9fafb', border: '1px solid #f3f4f6',
    borderRadius: 12, padding: '12px 14px',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  infoRow:  { display: 'flex', alignItems: 'flex-start', gap: 10 },
  infoIcon: { fontSize: 15, lineHeight: 1.4, flexShrink: 0 },
  infoText: { fontSize: 12, color: '#374151', lineHeight: 1.5 },

  // Camera section
  camSection: {
    width: '100%', display: 'flex', flexDirection: 'column', gap: 10,
  },
  camTitle: { fontSize: 12, fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 },
  videoWrap: {
    width: '100%', aspectRatio: '16/9' as any,
    borderRadius: 12, overflow: 'hidden',
    background: '#0d0d0d', position: 'relative',
  },
  video: { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' },
  camOverlay: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.3s',
  },
  camBadgeOk: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#22c55e', color: '#fff',
    padding: '6px 14px', borderRadius: 999,
    fontSize: 12, fontWeight: 700,
  },
  camBadgeFail: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#ef4444', color: '#fff',
    padding: '6px 14px', borderRadius: 999,
    fontSize: 12, fontWeight: 700,
  },
  checkBtn: {
    width: '100%', height: 40, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all 0.2s',
  },

  btn: {
    width: '100%', height: 48, borderRadius: 12, border: 'none',
    background: 'linear-gradient(135deg,#111827,#374151)',
    color: '#fff', fontSize: 15, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'inherit', transition: 'opacity 0.15s',
  },
  note: { fontSize: 11, color: '#d1d5db', textAlign: 'center', margin: 0 },
};

// ── Finished Banner ───────────────────────────────────────────────────────────
function FinishedBanner({ reason }: { reason: string }) {
  return (
    <div style={fb.wrap}>
      <div style={fb.icon}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div>
        <p style={fb.title}>Тест завершён</p>
        <p style={fb.sub}>{reason}</p>
      </div>
    </div>
  );
}
const fb: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 12, padding: '12px 16px',
    width: '100%', maxWidth: 680,
  },
  icon: {
    width: 36, height: 36, borderRadius: '50%', background: '#fee2e2',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  title: { fontSize: 14, fontWeight: 700, color: '#991b1b', margin: 0 },
  sub:   { fontSize: 12, color: '#b91c1c', margin: 0, marginTop: 2 },
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TestPage() {
  const { token } = useParams<{ token: string | undefined }>();

  const { data: jwtToken, isLoading: isAuthLoading, isError } = useGetAccessTokenQuery(token as any, { skip: !token });
  const { messages, currentStream, isStreaming, sendMessage } = useChatStream(jwtToken);

  const [input, setInput]           = useState('');
  const [faceStatus, setFaceStatus] = useState<FaceStatus>('idle');
  const [camError, setCamError]     = useState(false);
  const [camSizeIdx, setCamSizeIdx] = useState(1);
  const [lastFace, setLastFace]     = useState<Exclude<FaceStatus, 'checking'>>('idle');

  // Modal & camera check
  const [showIntro, setShowIntro]   = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [camCheck, setCamCheck]     = useState<CamCheck>('idle');

  // Finish
  const [isFinished, setIsFinished]     = useState(false);
  const [finishReason, setFinishReason] = useState('');

  // Timer
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);

  const consecFailsRef  = useRef(0);
  const isFinishedRef   = useRef(false);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging      = useRef(false);
  const dragOffset    = useRef({ x: 0, y: 0 });
  const popupRef      = useRef<HTMLDivElement>(null);

  const videoRef        = useRef<HTMLVideoElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const streamRef       = useRef<MediaStream | null>(null);
  const messagesEnd     = useRef<HTMLDivElement>(null);
  const textareaRef     = useRef<HTMLTextAreaElement>(null);
  const faceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);

  // Camera popup position
  useEffect(() => {
    const update = () => setPos({ x: window.innerWidth - CAM_SIZES[camSizeIdx] - 16, y: 16 });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Start camera stream on mount (needed for modal preview too)
  useEffect(() => {
  let active = true;

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      if (!active) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;

      if (video) {
        video.srcObject = stream;

        // ВАЖНО: ждать loadedmetadata
        video.onloadedmetadata = async () => {
          try {
            await video.play();
          } catch (e) {
            console.error('video.play() failed', e);
          }
        };
      }

    } catch (err) {
      console.error('getUserMedia error:', err);
      if (active) setCamError(true);
    }
  };

  startCamera();

  return () => {
    active = false;
    streamRef.current?.getTracks().forEach(t => t.stop());
  };
}, []);

const forcePlay = () => {
  const video = videoRef.current;
  if (video) {
    video.play().catch(() => {});
  }
};

  const handleFinish = useCallback(async (reason: string) => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsFinished(true);
    setFinishReason(reason);
    if (faceIntervalRef.current) clearInterval(faceIntervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    try { 
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/test/finish`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${jwtToken}`,
        },
      });

    
    } catch { /* silent */ }
  }, [jwtToken]);

  const checkFace = useCallback(async () => {
    if (isFinishedRef.current) return;
    const video = videoRef.current, canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;
    setFaceStatus('checking');
    try {
      const photo  = captureFrameBase64(video, canvas);
      const result = await detectFace(photo, jwtToken)
      const isFail = !result.same_person || result.num_faces_on_photo === 0;
      if (isFail) {
        consecFailsRef.current += 1;
        setFaceStatus('no_face'); setLastFace('no_face');
        if (consecFailsRef.current >= 3)
          handleFinish('Лицо не обнаружено 3 раза подряд. Тест завершён автоматически.');
      } else {
        consecFailsRef.current = 0;
        setFaceStatus('ok'); setLastFace('ok');
      }
    } catch {
      consecFailsRef.current += 1;
      setFaceStatus('error'); setLastFace('error');
      if (consecFailsRef.current >= 3)
        handleFinish('Ошибка проверки личности 3 раза подряд. Тест завершён автоматически.');
    }
  }, [detectFace, token, handleFinish, jwtToken]);

  useEffect(() => {
    if (showIntro || isFinished) return;
    faceIntervalRef.current = setInterval(checkFace, 3000);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinish('Время вышло. Тест завершён автоматически.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (faceIntervalRef.current) clearInterval(faceIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showIntro, isFinished, checkFace, handleFinish]);

  // Auto-scroll
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, currentStream]);

  // Textarea height
  useEffect(() => {
    const el = textareaRef.current; if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [input]);

  // Mouse drag
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }, [pos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const popup = popupRef.current; if (!popup) return;
      setPos({
        x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth  - popup.offsetWidth)),
        y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - popup.offsetHeight)),
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  // Touch drag
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const t = e.touches[0];
    dragging.current = true;
    dragOffset.current = { x: t.clientX - pos.x, y: t.clientY - pos.y };
  }, [pos]);

  useEffect(() => {
    const onMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      const popup = popupRef.current; if (!popup) return;
      const t = e.touches[0];
      setPos({
        x: Math.max(0, Math.min(t.clientX - dragOffset.current.x, window.innerWidth  - popup.offsetWidth)),
        y: Math.max(0, Math.min(t.clientY - dragOffset.current.y, window.innerHeight - popup.offsetHeight)),
      });
    };
    const onEnd = () => { dragging.current = false; };
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    return () => { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
  }, []);

  // Camera check in modal (one-shot face detection)
  const handleCheckCam = useCallback(async () => {
  const video = videoRef.current
  const canvas = canvasRef.current

  if (!video || !canvas || video.readyState < 2) {
    setCamCheck('fail')
    return
  }

  setCamCheck('checking')

  forcePlay()

  try {
    const photo = captureFrameBase64(video, canvas)
    const result = await detectFace(photo, jwtToken)

    const isValid =
      result.same_person === true &&
      result.num_faces_on_photo === 1

    setCamCheck(isValid ? 'ok' : 'fail')

  } catch (e) {
    setCamCheck('fail')
  }
}, [jwtToken])

  const chatSessionId = 'sadsa'

  const handleStart = async () => {
  setIsStarting(true);

  try {
    if (chatSessionId) {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/test/initialize`, {
        method: "POST",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chatSessionId }),
        });

      // if (res) {
      //   setCamCheck('fail');
      //   setIsStarting(false);
      //   return;
      // }
    }

    setShowIntro(false); 
  } catch (e) {
            // setCamCheck('fail');

  }

  setIsStarting(false);
};

  const handleSend = () => {
    if (!input.trim() || isStreaming || isFinished) return;
    sendMessage(input); setInput('');
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Auth guards ───────────────────────────────────────────────────────────
  if (isAuthLoading) return <div style={s.centered}><CircularProgress sx={{ color: '#111827' }} /></div>;
  if (isError || !jwtToken) return (
    <div style={s.centered}><p style={{ color: '#ef4444', fontSize: 14 }}>Ошибка авторизации — неверный или просроченный токен.</p></div>
  );

  const { label, dot } = FACE_STATUS[faceStatus];
  const isEmpty        = messages.length === 0 && !currentStream;
  const camWidth       = CAM_SIZES[camSizeIdx];

  const timerPct     = (timeLeft / TIMER_DURATION) * 100;
  const timerUrgent  = timeLeft <= 60;
  const timerWarning = timeLeft <= 180;
  const timerColor   = timerUrgent ? '#ef4444' : timerWarning ? '#f59e0b' : '#22c55e';
  const timerTextColor = timerUrgent ? '#b91c1c' : timerWarning ? '#92400e' : '#111827';

  return (
    <div style={s.root}>
      <style>{`
        @keyframes fadeUp      { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
        @keyframes recBlink    { 50% { opacity: 0.15 } }
        @keyframes cursorBlink { 50% { opacity: 0 } }
        @keyframes pulse       { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        textarea:focus { outline: none; }
        textarea { font-family: inherit; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
      `}</style>

      {/* Intro modal */}
      {showIntro && (
        <IntroModal
          onStart={handleStart}
          isStarting={isStarting}
          videoRef={videoRef}
          canvasRef={canvasRef}
          camCheck={camCheck}
          onCheckCam={handleCheckCam}
        />
      )}

      {/* ── Layout: timer sidebar + chat ── */}
      <div style={s.layout}>

        {/* ── Left: Timer panel ── */}
        {!showIntro && (
          <div style={{
            ...s.timerPanel,
            background: timerUrgent ? '#fff5f5' : timerWarning ? '#fffdf0' : '#fff',
            borderRightColor: timerUrgent ? '#fecaca' : timerWarning ? '#fde68a' : '#f3f4f6',
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

              {/* Progress ring (SVG) */}
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  {/* Track */}
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#f3f4f6" strokeWidth="6"/>
                  {/* Fill */}
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none"
                    stroke={timerColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - timerPct / 100)}`}
                    transform="rotate(-90 40 40)"
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
                  />
                </svg>
                {/* Center icon */}
                <div style={s.ringIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke={timerColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
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
              onClick={() => handleFinish('Тест завершён вручную.')}
              disabled={isFinished}
            >
              Завершить тест
            </button>
          </div>
        )}

        {/* ── Right: Chat ── */}
        <div style={s.chatWrapper}>

          {/* Header */}
          <div style={s.header}>
            <div style={s.headerLeft}>
              <div style={{
                ...s.headerDot,
                background: isFinished ? '#ef4444' : '#22c55e',
                boxShadow: isFinished ? '0 0 0 3px #fee2e2' : '0 0 0 3px #dcfce7',
              }}/>
              <span style={s.headerTitle}>AI Интервью</span>
            </div>
            {!isEmpty && <span style={s.headerCount}>{messages.length} сообщений</span>}
          </div>

          {/* Messages */}
          <div style={s.messagesArea}>
            <div style={s.messagesInner}>
              {isEmpty && !isFinished && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '40px 20px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center' }}>Напишите первое сообщение, чтобы начать интервью</p>
                </div>
              )}

              {messages.map((msg, index) => (
                <div key={index} style={{ ...s.messageRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role !== 'user' && <div style={s.aiAvatar}>AI</div>}
                  <div style={msg.role === 'user' ? s.userBubble : s.aiBubble}>{msg.content}</div>
                </div>
              ))}

              {currentStream && (
                <div style={{ ...s.messageRow, justifyContent: 'flex-start' }}>
                  <div style={s.aiAvatar}>AI</div>
                  <div style={s.aiBubble}>{currentStream}<span style={s.cursor}/></div>
                </div>
              )}

              <div ref={messagesEnd}/>
            </div>
          </div>

          {/* Input */}
          <div style={s.inputArea}>
            {isFinished && <FinishedBanner reason={finishReason}/>}
            <div style={{ ...s.inputBox, opacity: isFinished ? 0.5 : 1, pointerEvents: isFinished ? 'none' : 'auto' }}>
              <textarea
                ref={textareaRef}
                style={s.textarea}
                placeholder={isFinished ? 'Тест завершён' : 'Введите ответ...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming || isFinished}
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming || isFinished}
                style={{
                  ...s.sendBtn,
                  opacity: !input.trim() || isStreaming || isFinished ? 0.35 : 1,
                  cursor: !input.trim() || isStreaming || isFinished ? 'not-allowed' : 'pointer',
                }}
              >
                {isStreaming ? <CircularProgress size={14} sx={{ color: '#fff' }}/> : <SendIcon sx={{ fontSize: 15 }}/>}
              </button>
            </div>
            {!isFinished && <p style={s.hint}>Enter — отправить · Shift+Enter — новая строка</p>}
          </div>
        </div>
      </div>

      {/* ── Camera popup ── */}
      {!showIntro && (
        <div
          ref={popupRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          style={{ ...s.popup, left: pos.x, top: pos.y, width: camWidth }}
        >
          <div style={{ position: 'relative', aspectRatio: '4/3' as any, background: '#0d0d0d' }}>
            {camError ? (
              <div style={s.camError}><span style={{ fontSize: 10, color: '#4b5563' }}>Нет камеры</span></div>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted style={s.video}/>
            )}
            <div style={s.recBadge}>
              <FiberManualRecordIcon sx={{ fontSize: 7, color: '#ef4444', animation: 'recBlink 1.5s ease-in-out infinite' }}/>
              <span style={s.recText}>REC</span>
            </div>
          </div>
          <div style={s.popupFooter}>
            <div style={s.faceStatus}>
              <span style={{ ...s.statusDot, background: dot }}/>
              <span style={s.statusLabel}>{label}</span>
            </div>
            <div style={s.sizeControls}>
              <button style={{ ...s.sizeBtn, opacity: camSizeIdx > 0 ? 1 : 0.3 }} onClick={() => camSizeIdx > 0 && setCamSizeIdx((i) => i - 1)}>
                <RemoveIcon sx={{ fontSize: 11 }}/>
              </button>
              <button style={{ ...s.sizeBtn, opacity: camSizeIdx < CAM_SIZES.length - 1 ? 1 : 0.3 }} onClick={() => camSizeIdx < CAM_SIZES.length - 1 && setCamSizeIdx((i) => i + 1)}>
                <AddIcon sx={{ fontSize: 11 }}/>
              </button>
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }}/>
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: {
    height: '100dvh', background: '#f9fafb',
    display: 'flex', flexDirection: 'column',
    fontFamily: "'Geist','Inter',sans-serif", overflow: 'hidden',
  },
  centered: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  layout: { flex: 1, display: 'flex', overflow: 'hidden' },

  // ── Timer panel ──
  timerPanel: {
    width: 200, flexShrink: 0,
    borderRight: '1px solid',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '28px 16px 20px',
    transition: 'background 0.5s, border-color 0.5s',
  },
  timerTop:     { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  timerHeading: { fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' },
  timerDisplay: {
    fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  ringIcon: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  timerTrack: { width: '100%', height: 5, borderRadius: 99, background: '#f3f4f6', overflow: 'hidden' },
  timerFill:  { height: '100%', borderRadius: 99 },
  timerBadge: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
  },
  timerBadgeDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },

  finishBtn: {
    width: '100%', height: 38, borderRadius: 10,
    border: '1.5px solid #e5e7eb', background: '#fff',
    color: '#374151', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color 0.15s, color 0.15s',
  },

  // ── Chat ──
  chatWrapper: {
    flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  header: {
    padding: '14px 24px', borderBottom: '1px solid #f3f4f6', background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 8 },
  headerDot:   { width: 8, height: 8, borderRadius: '50%', transition: 'background 0.3s, box-shadow 0.3s' },
  headerTitle: { fontSize: 15, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' },
  headerCount: { fontSize: 11, color: '#9ca3af', fontWeight: 500 },

  messagesArea:  { flex: 1, overflowY: 'auto', padding: '0 16px 16px' },
  messagesInner: { maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 },

  messageRow: { display: 'flex', alignItems: 'flex-end', gap: 8 },
  aiAvatar: {
    width: 26, height: 26, borderRadius: '50%', background: '#111827',
    color: '#fff', fontSize: 9, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, letterSpacing: 0.4,
  },
  userBubble: {
    maxWidth: '72%', background: '#111827', color: '#fff',
    padding: '10px 14px', borderRadius: '18px 4px 18px 18px',
    fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
  },
  aiBubble: {
    maxWidth: '72%', background: '#fff', color: '#111827',
    padding: '10px 14px', borderRadius: '4px 18px 18px 18px',
    fontSize: 14, lineHeight: 1.6, border: '1px solid #f3f4f6', whiteSpace: 'pre-wrap',
  },
  cursor: {
    display: 'inline-block', width: 2, height: 13, background: '#9ca3af',
    marginLeft: 2, verticalAlign: 'middle',
    animation: 'cursorBlink 1s step-start infinite', borderRadius: 1,
  },

  inputArea: {
    padding: '10px 16px 18px', background: '#f9fafb',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
  },
  inputBox: {
    width: '100%', maxWidth: 680, background: '#fff',
    border: '1px solid #e5e7eb', borderRadius: 16,
    display: 'flex', alignItems: 'flex-end', gap: 8,
    padding: '10px 10px 10px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    transition: 'opacity 0.2s',
  },
  textarea: {
    flex: 1, resize: 'none', border: 'none', background: 'transparent',
    fontSize: 14, lineHeight: 1.55, color: '#111827', maxHeight: 160, overflowY: 'auto',
  },
  sendBtn: {
    width: 34, height: 34, borderRadius: 10, background: '#111827',
    border: 'none', color: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0, transition: 'opacity 0.15s',
  },
  hint: { fontSize: 11, color: '#d1d5db' },

  // ── Camera popup ──
  popup: {
    position: 'fixed', background: '#141414', borderRadius: 14,
    overflow: 'hidden', zIndex: 1300, cursor: 'grab', userSelect: 'none',
    boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
    transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
  },
  video:    { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' },
  camError: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 80 },
  recBadge: {
    position: 'absolute', top: 7, right: 7,
    display: 'flex', alignItems: 'center', gap: 3,
    background: 'rgba(0,0,0,0.6)', borderRadius: 5, padding: '2px 6px',
  },
  recText: { fontSize: 9, color: '#fff', fontWeight: 700, letterSpacing: 0.8 },

  popupFooter:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px' },
  faceStatus:   { display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, overflow: 'hidden' },
  statusDot:    { width: 6, height: 6, borderRadius: '50%', flexShrink: 0, transition: 'background 0.3s' },
  statusLabel:  { fontSize: 9, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  sizeControls: { display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 },
  sizeBtn: {
    background: 'rgba(255,255,255,0.08)', border: 'none', color: '#9ca3af',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 20, height: 20, borderRadius: 5, padding: 0,
    cursor: 'pointer', transition: 'opacity 0.15s',
  },
};
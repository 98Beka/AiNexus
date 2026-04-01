import { useState, useEffect, useRef, useCallback } from 'react';
import { CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { useGetAccessTokenQuery } from '@/entities/chat/api/chatApi';
import { useChatStream } from '@/features/chat/lib/useChatStream';
import { useDetectFaceMutation } from '@/entities/chat/api/faceApi';
import { useParams } from 'react-router-dom';

type FaceStatus = 'idle' | 'checking' | 'ok' | 'no_face' | 'error';

const FACE_STATUS: Record<FaceStatus, { label: string; dot: string }> = {
  idle:     { label: 'Ожидание',        dot: '#6b7280' },
  checking: { label: 'Ожидание',        dot: '#6b7280' },
  ok:       { label: 'Лицо найдено',   dot: '#22c55e' },
  no_face:  { label: 'Лицо не найдено', dot: '#ef4444' },
  error:    { label: 'Ошибка',          dot: '#ef4444' },
};

const CAM_SIZES = [150, 225, 350];

function captureFrameBase64(video: HTMLVideoElement, canvas: HTMLCanvasElement): string {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d')!.drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
}

function ReadyCard({ lastFace }: { lastFace: Exclude<FaceStatus, 'checking'> }) {
  const checks = [
    { label: 'Камера подключена',  ok: lastFace !== 'idle' && lastFace !== 'error' },
    { label: 'Лицо обнаружено',    ok: lastFace === 'ok' },
    { label: 'Запись активна',     ok: lastFace !== 'idle' },
  ];
  const allReady = checks.every((c) => c.ok);

  return (
    <div style={rs.wrap}>
      <div style={rs.iconRing}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>

      <p style={rs.title}>Подготовка к интервью</p>
      <p style={rs.sub}>Убедитесь, что всё готово перед началом</p>

      <div style={rs.card}>
        {checks.map((c) => (
          <div key={c.label} style={rs.row}>
            <div style={{ ...rs.dot, background: c.ok ? '#22c55e' : '#e5e7eb' }}>
              {c.ok && (
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ ...rs.rowLabel, color: c.ok ? '#111827' : '#9ca3af' }}>{c.label}</span>
          </div>
        ))}
      </div>

      <div style={{
        ...rs.badge,
        background: allReady ? '#f0fdf4' : '#fffbeb',
        border: `1px solid ${allReady ? '#bbf7d0' : '#fde68a'}`,
      }}>
        <span style={{
          ...rs.badgeDot,
          background: allReady ? '#22c55e' : '#f59e0b',
          animation: allReady ? 'none' : 'pulse 1.4s ease-in-out infinite',
        }}/>
        <span style={{ ...rs.badgeText, color: allReady ? '#15803d' : '#92400e' }}>
          {allReady ? 'Готово к началу' : 'Ожидание готовности...'}
        </span>
      </div>

      <p style={rs.hint}>Напишите первое сообщение, чтобы начать</p>
    </div>
  );
}

const rs: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 16, padding: '40px 20px', maxWidth: 360, margin: '0 auto',
  },
  iconRing: {
    width: 60, height: 60, borderRadius: '50%',
    background: '#fff', border: '1.5px solid #e5e7eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  title: { fontSize: 17, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', textAlign: 'center', margin: 0 },
  sub:   { fontSize: 13, color: '#6b7280', textAlign: 'center', margin: 0 },
  card: {
    width: '100%', background: '#fff', border: '1px solid #f3f4f6',
    borderRadius: 12, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 11,
  },
  row:      { display: 'flex', alignItems: 'center', gap: 10 },
  dot: {
    width: 18, height: 18, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'background 0.3s',
  },
  rowLabel: { fontSize: 13, fontWeight: 500, transition: 'color 0.3s' },
  badge: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '7px 14px', borderRadius: 999,
  },
  badgeDot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  badgeText: { fontSize: 12, fontWeight: 600 },
  hint: { fontSize: 12, color: '#d1d5db', textAlign: 'center', margin: 0 },
};

export default function TestPage() {
  const { token } = useParams<{ token: string | undefined }>();

  const { data: jwtToken, isLoading: isAuthLoading, isError } = useGetAccessTokenQuery(token as any, {
    skip: !token,
  });

  const { messages, currentStream, isStreaming, sendMessage } = useChatStream(jwtToken);
  const [detectFace] = useDetectFaceMutation();

  const [input, setInput]           = useState('');
  const [faceStatus, setFaceStatus] = useState<FaceStatus>('idle');
  const [camError, setCamError]     = useState(false);
  const [camSizeIdx, setCamSizeIdx] = useState(1);

  const [lastFace, setLastFace] = useState<Exclude<FaceStatus, 'checking'>>('idle');

  const [pos, setPos]   = useState({ x: 0, y: 0 });
  const dragging        = useRef(false);
  const dragOffset      = useRef({ x: 0, y: 0 });
  const popupRef        = useRef<HTMLDivElement>(null);

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  useEffect(() => {
    const updatePosition = () => {
      setPos({
        x: window.innerWidth - CAM_SIZES[camSizeIdx] - 16,
        y: 16, 
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [])

  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      })
      .catch(() => { if (active) setCamError(true); });
    return () => { active = false; streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const checkFace = useCallback(async () => {
    const video = videoRef.current, canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;
    setFaceStatus('checking');
    try {
      const photo = captureFrameBase64(video, canvas);
      const hasFace = await detectFace({ photo }).unwrap();
      const result: FaceStatus = hasFace ? 'ok' : 'no_face';
      setFaceStatus(result);
      setLastFace(result);
    } catch {
      setFaceStatus('error');
      setLastFace('error');
    }
  }, [detectFace]);

  useEffect(() => { const id = setInterval(checkFace, 3000); return () => clearInterval(id); }, [checkFace]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, currentStream]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [input]);

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

  const onBig = () => {
  if (camSizeIdx >= CAM_SIZES.length - 1) return

  const oldWidth = CAM_SIZES[camSizeIdx]
  const newWidth = CAM_SIZES[camSizeIdx + 1]

  const oldHeight = (oldWidth * 3) / 4
  const newHeight = (newWidth * 3) / 4

  let newX = pos.x
  let newY = pos.y

  if (pos.x + oldWidth > window.innerWidth) {
    newX = pos.x - (newWidth - oldWidth)
  }

  if (pos.y + oldHeight > window.innerHeight) {
    newY = pos.y - (newHeight - oldHeight)
  }

  const maxX = window.innerWidth - newWidth - 10
  const maxY = window.innerHeight - newHeight

  newX = Math.max(0, Math.min(newX, maxX))
  newY = Math.max(0, Math.min(newY, maxY))

  setPos({
    x: newX,
    y: newY,
  })

  setCamSizeIdx((i) => i + 1)
}

  const handleSend = () => { if (!input.trim() || isStreaming) return; sendMessage(input); setInput(''); };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (isAuthLoading) return (
    <div style={s.centered}><CircularProgress sx={{ color: '#111827' }} /></div>
  );
  if (isError || !jwtToken) return (
    <div style={s.centered}><p style={{ color: '#ef4444', fontSize: 14 }}>Ошибка авторизации — неверный или просроченный токен.</p></div>
  );

  const { label, dot } = FACE_STATUS[faceStatus];
  const isEmpty        = messages.length === 0 && !currentStream;
  const camWidth       = CAM_SIZES[camSizeIdx];

  return (
    <div style={s.root}>

      <div style={s.chatWrapper}>

        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.headerDot} />
            <span style={s.headerTitle}>AI Интервью</span>
          </div>
          {!isEmpty && <span style={s.headerCount}>{messages.length} сообщений</span>}
        </div>

        <div style={s.messagesArea}>
          <div style={s.messagesInner}>

            {isEmpty && <ReadyCard lastFace={lastFace} />}

            {messages.map((msg,index) => (
              <div key={index} style={{ ...s.messageRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role !== 'user' && <div style={s.aiAvatar}>AI</div>}
                <div style={msg.role === 'user' ? s.userBubble : s.aiBubble}>{msg.content}</div>
              </div>
            ))}

            {currentStream && (
              <div style={{ ...s.messageRow, justifyContent: 'flex-start' }}>
                <div style={s.aiAvatar}>AI</div>
                <div style={s.aiBubble}>
                  {currentStream}<span style={s.cursor} />
                </div>
              </div>
            )}

            <div ref={messagesEnd} />
          </div>
        </div>

        <div style={s.inputArea}>
          <div style={s.inputBox}>
            <textarea
              ref={textareaRef}
              style={s.textarea}
              placeholder="Введите ответ..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              style={{ ...s.sendBtn, opacity: !input.trim() || isStreaming ? 0.35 : 1, cursor: !input.trim() || isStreaming ? 'not-allowed' : 'pointer' }}
            >
              {isStreaming ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SendIcon sx={{ fontSize: 15 }} />}
            </button>
          </div>
          <p style={s.hint}>Enter — отправить · Shift+Enter — новая строка</p>
        </div>
      </div>

      <div
        ref={popupRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{ ...s.popup, left: pos.x, top: pos.y, width: camWidth }}
      >
        <div style={{ position: 'relative', aspectRatio: '4/3' as any, background: '#0d0d0d' }}>
          {camError ? (
            <div style={s.camError}>
              <span style={{ fontSize: 10, color: '#4b5563' }}>Нет камеры</span>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted style={s.video} />
          )}
          <div style={s.recBadge}>
            <FiberManualRecordIcon sx={{ fontSize: 7, color: '#ef4444', animation: 'recBlink 1.5s ease-in-out infinite' }} />
            <span style={s.recText}>REC</span>
          </div>
        </div>

        <div style={s.popupFooter}>
          <div style={s.faceStatus}>
            <span style={{ ...s.statusDot, background: dot }} />
            <span style={s.statusLabel}>{label}</span>
          </div>
          <div style={s.sizeControls}>
            <button
              style={{ ...s.sizeBtn, opacity: camSizeIdx > 0 ? 1 : 0.3 }}
              onClick={() => camSizeIdx > 0 && setCamSizeIdx((i) => i - 1)}
            >
              <RemoveIcon sx={{ fontSize: 11 }} />
            </button>
            <button
              style={{ ...s.sizeBtn, opacity: camSizeIdx < CAM_SIZES.length - 1 ? 1 : 0.3 }}
              onClick={onBig}
            >
              <AddIcon sx={{ fontSize: 11 }} />
            </button>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <style>{`
        @keyframes recBlink    { 50% { opacity: 0.15 } }
        @keyframes cursorBlink { 50% { opacity: 0 } }
        @keyframes pulse       { 0%,100% { opacity:1 } 50% { opacity:0.35 } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        textarea:focus { outline: none; }
        textarea { font-family: inherit; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: {
    height: '100dvh', background: '#f9fafb',
    display: 'flex', flexDirection: 'column',
    fontFamily: "'Geist', 'Inter', sans-serif", overflow: 'hidden',
  },
  centered: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  chatWrapper: {
    flex: 1, display: 'flex', flexDirection: 'column',
    overflow: 'hidden', maxWidth: 760, width: '100%', margin: '0 auto',
  },
  header: {
    padding: '14px 24px', borderBottom: '1px solid #f3f4f6', background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 8 },
  headerDot:   { width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px #dcfce7' },
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

  popupFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px',
  },
  faceStatus:  { display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, overflow: 'hidden' },
  statusDot:   { width: 6, height: 6, borderRadius: '50%', flexShrink: 0, transition: 'background 0.3s' },
  statusLabel: { fontSize: 9, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  sizeControls:{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 },
  sizeBtn: {
    background: 'rgba(255,255,255,0.08)', border: 'none', color: '#9ca3af',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 20, height: 20, borderRadius: 5, padding: 0,
    cursor: 'pointer', transition: 'opacity 0.15s',
  },
};
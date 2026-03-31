import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, IconButton,
  CircularProgress, Chip, Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { useGetAccessTokenQuery } from '@/entities/chat/api/chatApi';
import { useChatStream } from '@/features/chat/lib/useChatStream';
import { useDetectFaceMutation } from '@/entities/chat/api/faceApi';
import { useParams } from 'react-router-dom';

type FaceStatus = 'idle' | 'checking' | 'ok' | 'no_face' | 'error';

const FACE_STATUS: Record<FaceStatus, { label: string; color: 'default' | 'warning' | 'success' | 'error' }> = {
  idle:     { label: 'Ожидание',        color: 'default' },
  checking: { label: 'Проверка...',     color: 'warning' },
  ok:       { label: 'Лицо определено', color: 'success' },
  no_face:  { label: 'Лицо не найдено', color: 'error'   },
  error:    { label: 'Ошибка',          color: 'error'   },
};

function captureFrameBase64(video: HTMLVideoElement, canvas: HTMLCanvasElement): string {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d')!.drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
}

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
  const [minimized, setMinimized]   = useState(false);

  // drag state
  const [pos, setPos]               = useState({ x: 16, y: 16 });
  const dragging                    = useRef(false);
  const dragOffset                  = useRef({ x: 0, y: 0 });
  const popupRef                    = useRef<HTMLDivElement>(null);

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);

  // ── Camera ───────────────────────────────────────────────────────────────

  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch(() => { if (active) setCamError(true); });

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Face detection every 3s ──────────────────────────────────────────────

  const checkFace = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    setFaceStatus('checking');
    try {
      const photo = captureFrameBase64(video, canvas);
      const hasFace = await detectFace({ photo }).unwrap();
      setFaceStatus(hasFace ? 'ok' : 'no_face');
    } catch {
      setFaceStatus('error');
    }
  }, [detectFace]);

  useEffect(() => {
    const id = setInterval(checkFace, 3000);
    return () => clearInterval(id);
  }, [checkFace]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStream]);

  // ── Drag (mouse) ─────────────────────────────────────────────────────────

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }, [pos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const popup = popupRef.current;
      if (!popup) return;
      const maxX = window.innerWidth  - popup.offsetWidth;
      const maxY = window.innerHeight - popup.offsetHeight;
      setPos({
        x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, maxX)),
        y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, maxY)),
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, []);

  // ── Drag (touch) ─────────────────────────────────────────────────────────

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const t = e.touches[0];
    dragging.current = true;
    dragOffset.current = { x: t.clientX - pos.x, y: t.clientY - pos.y };
  }, [pos]);

  useEffect(() => {
    const onMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      const popup = popupRef.current;
      if (!popup) return;
      const t = e.touches[0];
      const maxX = window.innerWidth  - popup.offsetWidth;
      const maxY = window.innerHeight - popup.offsetHeight;
      setPos({
        x: Math.max(0, Math.min(t.clientX - dragOffset.current.x, maxX)),
        y: Math.max(0, Math.min(t.clientY - dragOffset.current.y, maxY)),
      });
    };
    const onEnd = () => { dragging.current = false; };
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend',  onEnd);
    return () => {
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend',  onEnd);
    };
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Auth guards ───────────────────────────────────────────────────────────

  if (isAuthLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !jwtToken) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">Ошибка авторизации — неверный или просроченный токен.</Typography>
      </Box>
    );
  }

  const { label, color } = FACE_STATUS[faceStatus];

  return (
    <Box position="relative" height="100vh" bgcolor="grey.100" p={2}>

      {/* ── Chat (full page) ── */}
      <Paper
        variant="outlined"
        elevation={0}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 3 }}
      >
        <Box px={3} py={2}>
          <Typography variant="h6" fontWeight={500}>AI тестирование</Typography>
        </Box>

        <Divider />

        <Box flex={1} overflow="auto" px={3} py={2} display="flex" flexDirection="column" gap={1.5}>
          {messages.length === 0 && !currentStream && (
            <Box m="auto" textAlign="center">
              <Typography color="text.disabled" variant="body2">
                Напишите сообщение, чтобы начать
              </Typography>
            </Box>
          )}

          {messages.map((msg,index) => (
            <Box
              key={index}
              alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
              maxWidth="72%"
            >
              <Paper
                elevation={0}
                sx={{
                  px: 2, py: 1.5,
                  borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                  bgcolor: msg.role === 'user' ? 'grey.900' : 'grey.100',
                  color: msg.role === 'user' ? '#fff' : 'text.primary',
                  ...(msg.role !== 'user' && { border: '0.5px solid', borderColor: 'divider' }),
                }}
              >
                <Typography variant="body2">{msg.content}</Typography>
              </Paper>
            </Box>
          ))}

          {currentStream && (
            <Box alignSelf="flex-start" maxWidth="72%">
              <Paper
                elevation={0}
                sx={{
                  px: 2, py: 1.5,
                  borderRadius: '4px 14px 14px 14px',
                  bgcolor: 'grey.100',
                  border: '0.5px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2">
                  {currentStream}
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: '2px',
                      height: '14px',
                      bgcolor: 'text.secondary',
                      ml: '2px',
                      verticalAlign: 'middle',
                      animation: 'blink 1s step-start infinite',
                      '@keyframes blink': { '50%': { opacity: 0 } },
                    }}
                  />
                </Typography>
              </Paper>
            </Box>
          )}

          <div ref={messagesEnd} />
        </Box>

        <Divider />

        <Box display="flex" gap={1} px={2} py={1.5}>
          <TextField
            fullWidth
            size="small"
            placeholder="Введите сообщение..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            sx={{
              width: 36, height: 36,
              bgcolor: 'grey.900', color: 'white', borderRadius: 2,
              '&:hover': { bgcolor: 'grey.800' },
              '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
            }}
          >
            {isStreaming
              ? <CircularProgress size={16} color="inherit" />
              : <SendIcon sx={{ fontSize: 16 }} />
            }
          </IconButton>
        </Box>
      </Paper>

      {/* ── Floating camera popup ── */}
      <Box
        ref={popupRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        sx={{
          position: 'fixed',
          left: pos.x,
          top:  pos.y,
          width: 200,
          bgcolor: '#1a1a1a',
          borderRadius: minimized ? '20px' : '14px',
          overflow: 'hidden',
          zIndex: 1300,
          cursor: 'grab',
          userSelect: 'none',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
          transition: 'border-radius 0.2s',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        {/* Video */}
        {!minimized && (
          <Box position="relative" sx={{ aspectRatio: '4/3', bgcolor: '#111' }}>
            {camError ? (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <Typography variant="caption" color="grey.600">Нет доступа к камере</Typography>
              </Box>
            ) : (
              <Box
                component="video"
                ref={videoRef}
                autoPlay
                playsInline
                muted
                sx={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' }}
              />
            )}

            {/* REC badge */}
            <Box
              position="absolute"
              top={7}
              right={7}
              display="flex"
              alignItems="center"
              gap={0.5}
              sx={{ bgcolor: 'rgba(0,0,0,0.55)', borderRadius: '5px', px: 0.75, py: 0.25 }}
            >
              <FiberManualRecordIcon
                sx={{
                  fontSize: 8,
                  color: 'error.main',
                  animation: 'blink 1.5s ease-in-out infinite',
                  '@keyframes blink': { '50%': { opacity: 0.2 } },
                }}
              />
              <Typography sx={{ fontSize: 10, color: '#fff', fontWeight: 500, letterSpacing: 0.5 }}>
                REC
              </Typography>
            </Box>
          </Box>
        )}

        {/* Footer */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 1, py: 0.75 }}
        >
          <Chip
            label={label}
            color={color}
            size="small"
            variant="outlined"
            sx={{ fontSize: 10, height: 20, borderRadius: '5px', fontWeight: 500 }}
          />
          <IconButton
            size="small"
            onClick={() => setMinimized((v) => !v)}
            sx={{ color: '#aaa', '&:hover': { color: '#fff' }, p: 0.25 }}
          >
            {minimized
              ? <AddIcon sx={{ fontSize: 16 }} />
              : <RemoveIcon sx={{ fontSize: 16 }} />
            }
          </IconButton>
        </Box>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </Box>
    </Box>
  );
}
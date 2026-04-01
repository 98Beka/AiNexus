import React, { useState, useEffect, useRef, useCallback } from 'react';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { CAM_SIZES, FACE_STATUS, MAX_FAILS } from '../model/constants';
import { detectFace } from '../api/api';
import { captureFrameBase64 } from '../lib/utils';
import { useDraggable } from '../model/useDraggable';
import type { FaceStatus } from '../model/types';
import type { RootState } from '@/app/store';
import { useSelector } from 'react-redux';

interface CameraPopupProps {
  isActive: boolean; // Если false (тест завершен/не начат) - проверки не идут
  onCriticalFail: (reason: string) => void; // Вызывается при 3 ошибках
}

export const CameraPopup: React.FC<CameraPopupProps> = ({ isActive, onCriticalFail }) => {
  const [camSizeIdx, setCamSizeIdx] = useState(1);
  const [camError, setCamError] = useState(false);
  const [faceStatus, setFaceStatus] = useState<FaceStatus>('idle');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const consecFailsRef = useRef(0);

  const access_token = useSelector((state:RootState) => state.session.accessToken)

  const { pos, onMouseDown, onTouchStart } = useDraggable(popupRef, CAM_SIZES[1]);

  // Запуск камеры
  useEffect(() => {
    let active = true;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current?.play().catch(() => {});
        }
      } catch (err) {
        if (active) setCamError(true);
      }
    };
    startCamera();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Цикл проверки лица
  const checkFace = useCallback(async () => {
    if (!isActive) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    setFaceStatus('checking');
    try {
      const photo = captureFrameBase64(video, canvas);
      const result = await detectFace(photo, access_token);
      const isFail = !result.same_person || result.num_faces_on_photo === 0;

      if (isFail) {
        consecFailsRef.current += 1;
        setFaceStatus('no_face');
        if (consecFailsRef.current >= MAX_FAILS) {
          onCriticalFail('Лицо не обнаружено 3 раза подряд. Тест завершён автоматически.');
        }
      } else {
        consecFailsRef.current = 0;
        setFaceStatus('ok');
      }
    } catch {
      consecFailsRef.current += 1;
      setFaceStatus('error');
      if (consecFailsRef.current >= MAX_FAILS) {
        onCriticalFail('Ошибка проверки личности 3 раза подряд. Тест завершён автоматически.');
      }
    }
  }, [isActive, access_token, onCriticalFail]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(checkFace, 3000);
    return () => clearInterval(interval);
  }, [isActive, checkFace]);

  const camWidth = CAM_SIZES[camSizeIdx];
  const { label, dot } = FACE_STATUS[faceStatus];

  if (!isActive) return null; // Или скрываем, если тест не идет

  return (
    <div
      ref={popupRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{ ...s.popup, left: pos.x, top: pos.y, width: camWidth }}
    >
      <div style={s.videoWrapper}>
        {camError ? (
          <div style={s.camError}><span style={{ fontSize: 10, color: '#4b5563' }}>Нет камеры</span></div>
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
          <button style={{ ...s.sizeBtn, opacity: camSizeIdx > 0 ? 1 : 0.3 }} onClick={() => camSizeIdx > 0 && setCamSizeIdx(i => i - 1)}>
            <RemoveIcon sx={{ fontSize: 11 }} />
          </button>
          <button style={{ ...s.sizeBtn, opacity: camSizeIdx < CAM_SIZES.length - 1 ? 1 : 0.3 }} onClick={() => camSizeIdx < CAM_SIZES.length - 1 && setCamSizeIdx(i => i + 1)}>
            <AddIcon sx={{ fontSize: 11 }} />
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

// Стили перенесены внутрь компонента или можно вынести в module.css
const s: Record<string, React.CSSProperties> = {
  popup: { position: 'fixed', background: '#141414', borderRadius: 14, overflow: 'hidden', zIndex: 1300, cursor: 'grab', userSelect: 'none', boxShadow: '0 8px 40px rgba(0,0,0,0.35)', transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)' },
  videoWrapper: { position: 'relative', aspectRatio: '4/3' as any, background: '#0d0d0d' },
  video: { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' },
  camError: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 80 },
  recBadge: { position: 'absolute', top: 7, right: 7, display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(0,0,0,0.6)', borderRadius: 5, padding: '2px 6px' },
  recText: { fontSize: 9, color: '#fff', fontWeight: 700, letterSpacing: 0.8 },
  popupFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px' },
  faceStatus: { display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, overflow: 'hidden' },
  statusDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0, transition: 'background 0.3s' },
  statusLabel: { fontSize: 9, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  sizeControls: { display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 },
  sizeBtn: { background: 'rgba(255,255,255,0.08)', border: 'none', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 5, padding: 0, cursor: 'pointer', transition: 'opacity 0.15s' },
};
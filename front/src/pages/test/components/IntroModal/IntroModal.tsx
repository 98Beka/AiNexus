import { useRef, useEffect, useState, useCallback } from 'react';
import { CircularProgress } from '@mui/material';
import { captureFrameBase64, detectFace, type CamCheck } from '@/features/camera';
import { styles } from './styles';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';

interface IntroModalProps {
  onStart: () => void;
  isStarting: boolean;
}

export function IntroModal({ onStart, isStarting }: IntroModalProps) {
  const [camCheck, setCamCheck] = useState<CamCheck>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const camOk = camCheck === 'ok';
  const access_token = useSelector((state:RootState) => state.session.accessToken);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleReady = () => {
      console.log("video ready", video.readyState);
    };
    video.addEventListener("loadeddata", handleReady);
    return () => {
      video.removeEventListener("loadeddata", handleReady);
    };
  }, []);

  const handleCheckCam = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setCamCheck('fail');
      return;
    }

    if (video.readyState < 2) {
      await new Promise<void>((resolve) => {
        video.onloadeddata = () => resolve();
      });
    }

    setCamCheck('checking');

    try {
      const photo = captureFrameBase64(video, canvas);
      const result = await detectFace(photo, access_token ?? "");

      setCamCheck(
        result.same_person && result.num_faces_on_photo === 1
          ? 'ok'
          : 'fail'
      );
    } catch (error) {
      console.error(error);
      setCamCheck('fail');
    }
  }, [access_token]);

  // Логика включения камеры инкапсулирована здесь
  useEffect(() => {
    let stream: MediaStream | null = null;

    navigator?.mediaDevices?.getUserMedia({ video: true })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error("Camera access denied:", err);
      });

    // Функция очистки: выключает камеру при размонтировании компонента
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []); // Пустой массив зависимостей, чтобы эффект сработал один раз

  const handleCheckCamClick = () => {
    // Проверяем, что элементы существуют, и передаем их в колбэк
    if (videoRef.current && canvasRef.current) {
      handleCheckCam();
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* ... иконка, заголовок, текст ... */}
        <div style={styles.iconWrap}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2 style={styles.title}>AI Интервью</h2>
        <p style={styles.sub}>Добро пожаловать! Ознакомьтесь с условиями перед началом</p>

        {/* ... блок с правилами ... */}
        <div style={styles.infoBlock}>
          {[
            { icon: '⏱', text: 'Длительность теста — 10 минут' },
            { icon: '📷', text: 'Камера должна быть включена на протяжении всего теста' },
            { icon: '👤', text: 'Ваше лицо должно быть чётко видно на камере' },
            { icon: '🚫', text: 'При 3 нарушениях подряд тест завершится автоматически' },
          ].map(({ icon, text }) => (
            <div key={text} style={styles.infoRow}>
              <span style={styles.infoIcon}>{icon}</span>
              <span style={styles.infoText}>{text}</span>
            </div>
          ))}
        </div>

        {/* ... секция проверки камеры (JSX без изменений, но логика onClick другая) ... */}
        <div style={styles.camSection}>
          <p style={styles.camTitle}>Проверка камеры</p>
          <div style={styles.videoWrap}>
            <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {camCheck !== 'idle' && (
              <div style={{ ...styles.camOverlay, background: camCheck === 'ok' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}>
                {camCheck === 'checking' && <CircularProgress size={24} sx={{ color: '#fff' }} />}
                {camCheck === 'ok' && <div style={styles.camBadgeOk}>✓ Камера готова</div>}
                {camCheck === 'fail' && <div style={styles.camBadgeFail}>ОШИБКА</div>}
              </div>
            )}
          </div>
          <button
            style={{ ...styles.checkBtn, background: camOk ? '#f0fdf4' : '#f9fafb', color: camOk ? '#15803d' : '#374151' }}
            onClick={handleCheckCamClick} // Используем новый обработчик
            disabled={camCheck === 'checking'}
          >
            {camCheck === 'checking' ? 'Проверка...' : 'Проверить камеру'}
          </button>
        </div>

        {/* ... кнопка старта ... */}
        <button
          style={{ ...styles.btn, opacity: (!camOk || isStarting) ? 0.45 : 1 }}
          onClick={onStart}

        >
          {isStarting ? 'Запуск...' : 'Начать тест →'}
        </button>
      </div>
    </div>
  );
}
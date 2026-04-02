import { useState, useRef } from 'react';
import { CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import { useCreateApplicantMutation } from '../../entities/applicant/applicantApi';
import { useNavigate } from 'react-router-dom';

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 12);
  if (!digits) return '';
  const norm = digits.startsWith('0')
    ? '996' + digits.slice(1)
    : digits.startsWith('996')
    ? digits
    : '996' + digits;
  const d = norm.slice(0, 12);
  let out = '+996';
  if (d.length > 3) out += ' ' + d.slice(3, 6);
  if (d.length > 6) out += ' ' + d.slice(6, 9);
  if (d.length > 9) out += ' ' + d.slice(9, 12);
  return out;
}

function onPhoneChange(e: React.ChangeEvent<HTMLInputElement>, set: (v: string) => void) {
  set(formatPhone(e.target.value));
}

function Field({ label, value, onChange, type = 'text', required = false, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div style={f.wrap}>
      <label style={f.label}>{label}{required && <span style={{ color: '#ef4444' }}> *</span>}</label>
      <input
        type={type} value={value} placeholder={placeholder} required={required}
        onChange={(e) => onChange(e.target.value)}
        style={f.input}
        onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}
const f: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' },
  input: {
    height: 44, padding: '0 14px', borderRadius: 10,
    border: '1.5px solid #e5e7eb', background: '#f9fafb',
    fontSize: 14, color: '#111827', outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit',
  },
};

export default function ApplicantSubmitPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', surname: '', patronymic: '', email: '' });
  const [phone, setPhone]               = useState('');
  const [photoPreview, setPhoto]        = useState<string | null>(null);
  const [photoFile, setPhotoFile]       = useState<File | null>(null);
  const [message, setMessage]           = useState<string | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [openCameraDialog, setOpenCameraDialog] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileRef   = useRef<HTMLInputElement>(null);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [createApplicant, { isLoading }] = useCreateApplicantMutation();

  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const processPhoto = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Выберите изображение'); return; }
    if (file.size > 5 * 1024 * 1024)    { setError('Максимум 5 MB'); return; }
    setPhotoFile(file);
    setPhoto(URL.createObjectURL(file));
    setError(null);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraOpen(true);
    } catch (err) {
      setError('Не удалось получить доступ к камере');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
          processPhoto(file);
          stopCamera();
          setOpenCameraDialog(false);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const handleOpenCameraDialog = () => {
    setOpenCameraDialog(true);
    startCamera();
  };

  const handleCloseCameraDialog = () => {
    stopCamera();
    setOpenCameraDialog(false);
  };

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoFile(null);
  };

  const toBase64 = (file: File): Promise<string> => new Promise((res, rej) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload  = () => res((r.result as string).split(',')[1]);
    r.onerror = rej;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createApplicant({
        ...form,
        patronymic: form.patronymic || undefined,
        phone: phone || undefined,
        photo: photoFile ? await toBase64(photoFile) : undefined,
      }).unwrap();
      setMessage(`Заявка отправлена! Проверьте почту — ${form.email}`);
      setForm({ name: '', surname: '', patronymic: '', email: '' });
      setPhone('');
      removePhoto();
    } catch {
      setError('Ошибка отправки. Проверьте данные и попробуйте снова.');
    }
  };

  return (
    <div style={p.page}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{margin:0;font-family:'Inter',sans-serif}
        input::placeholder{color:#9ca3af}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      `}</style>
      
       <p onClick={() => navigate('/auth')} style={{ position: "fixed", top: 15, right: 20, color:"lightgray", cursor: 'pointer' }}>
              войти как админ
            </p>

      <div style={p.blob1} /><div style={p.blob2} />

      <div style={p.grid}>

        <div style={p.left}>
          <div style={p.pill}>✦ &nbsp;Набор открыт</div>

          <h1 style={p.h1}>
            inVision<br />
            <span style={p.accent}>University</span>
          </h1>

          <p style={p.sub}>
            Построй карьеру в IT — пройди отбор и получи доступ к обучению от практикующих специалистов.
          </p>

          <div style={p.steps}>
            {[['01', 'Заполни заявку'], ['02', 'Получи ссылку на интервью'], ['03', 'Начни обучение']].map(([n, t]) => (
              <div key={n} style={p.step}>
                <div style={p.stepNum}>{n}</div>
                <span style={p.stepTxt}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={p.card}>
          <h2 style={p.cardH}>Подать заявку</h2>
          <p style={p.cardSub}>Заполните форму — мы пришлём ссылку на email</p>

          {message && <div style={p.ok}><span>✓</span> {message}</div>}
          {error   && <div style={p.err}><span>✕</span> {error}</div>}

          <form onSubmit={handleSubmit} style={p.form}>
            <div style={p.row3}>
              <Field label="Имя"     value={form.name}    onChange={set('name')}    required placeholder="Алексей" />
              <Field label="Фамилия" value={form.surname} onChange={set('surname')} required placeholder="Иванов" />
            </div>
            <Field label="Отчество" value={form.patronymic} onChange={set('patronymic')} placeholder="Сергеевич" />

            <Field label="Email" value={form.email} onChange={set('email')} type="email" required placeholder="you@example.com" />

            <div style={f.wrap}>
              <label style={f.label}>Телефон</label>
              <input
                type="tel" value={phone} placeholder="+996 700 000 000"
                onChange={(e) => onPhoneChange(e, setPhone)}
                style={f.input}
                onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                onBlur={(e)  => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={f.wrap}>
              <label style={f.label}>Фото профиля</label>
              <input
                ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => { const fi = e.target.files?.[0]; if (fi) processPhoto(fi); }}
              />

              {!photoPreview ? (
                <div style={p.drop} onClick={() => fileRef.current?.click()}>
                  <div style={p.dropIcon}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p style={p.dropTxt}>Загрузите фото или сделайте снимок</p>
                  <div style={p.dropBtns}>
                    <button type="button" style={p.dbtn} onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                      <AddPhotoAlternateIcon sx={{ fontSize: 15 }} /> Галерея
                    </button>
                    <button type="button" style={{ ...p.dbtn, ...p.dbtnDark }} onClick={(e) => { e.stopPropagation(); handleOpenCameraDialog(); }}>
                      <CameraAltIcon sx={{ fontSize: 15 }} /> Камера
                    </button>
                  </div>
                </div>
              ) : (
                <div style={p.preview}>
                  <img src={photoPreview} alt="" style={p.previewImg} />
                  <div style={p.previewBar}>
                    <button type="button" style={p.pBtn} onClick={() => fileRef.current?.click()}>Изменить</button>
                    <button type="button" style={{ ...p.pBtn, background: 'rgba(239,68,68,0.6)' }} onClick={removePhoto}>Удалить</button>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading} style={{ ...p.submit, opacity: isLoading ? 0.7 : 1 }}>
              {isLoading
                ? <><CircularProgress size={15} sx={{ color: '#fff' }} /> Отправка...</>
                : 'Отправить заявку →'}
            </button>
          </form>
        </div>
      </div>

      <Dialog open={openCameraDialog} onClose={handleCloseCameraDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Сделать фото
          <IconButton onClick={handleCloseCameraDialog} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              display: isCameraOpen ? 'block' : 'none',
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            startIcon={<CameraAltIcon />}
            onClick={capturePhoto}
            disabled={!isCameraOpen}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Сделать фото
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const p: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', background: '#080810',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '32px 16px', position: 'relative', overflow: 'hidden',
    fontFamily: "'Inter','Geist',sans-serif",
  },
  blob1: {
    position: 'fixed', top: '-15%', left: '-10%', width: 600, height: 600,
    borderRadius: '50%', pointerEvents: 'none',
    background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)',
  },
  blob2: {
    position: 'fixed', bottom: '-20%', right: '-5%', width: 500, height: 500,
    borderRadius: '50%', pointerEvents: 'none',
    background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
    gap: 56, maxWidth: 1060, width: '100%', alignItems: 'center', position: 'relative', zIndex: 1,
  },

  // left
  left:    { display: 'flex', flexDirection: 'column', gap: 28 },
  pill:    {
    display: 'inline-flex', alignItems: 'center', width: 'fit-content',
    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 700,
    color: '#a5b4fc', letterSpacing: '0.04em',
  },
  h1:      { fontSize: 'clamp(34px,5vw,54px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em' },
  accent:  { background: 'linear-gradient(135deg,#6366f1,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  sub:     { fontSize: 15, color: '#9ca3af', lineHeight: 1.75, maxWidth: 400 },
  steps:   { display: 'flex', flexDirection: 'column', gap: 12 },
  step:    { display: 'flex', alignItems: 'center', gap: 14 },
  stepNum: {
    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
    color: '#818cf8', fontSize: 11, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.05em',
  },
  stepTxt: { fontSize: 14, color: '#d1d5db', fontWeight: 500 },
  statsRow: { display: 'flex', gap: 28, marginTop: 8 },
  stat:    { display: 'flex', flexDirection: 'column', gap: 2 },
  statVal: { fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' },
  statLbl: { fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },

  // card
  card:    { background: '#fff', borderRadius: 20, padding: '36px 32px', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', animation: 'fadeUp 0.4s ease' },
  cardH:   { fontSize: 20, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' },
  cardSub: { fontSize: 13, color: '#9ca3af', marginTop: 4, marginBottom: 22 },
  form:    { display: 'flex', flexDirection: 'column', gap: 14 },
  row3:    { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 },

  ok:  { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#15803d', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, marginBottom: 4 },
  err: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, marginBottom: 4 },

  // dropzone
  drop:     { border: '2px dashed #e5e7eb', borderRadius: 12, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: '#f9fafb', cursor: 'pointer' },
  dropIcon: { width: 44, height: 44, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dropTxt:  { fontSize: 13, color: '#9ca3af' },
  dropBtns: { display: 'flex', gap: 8 },
  dbtn:     { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  dbtnDark: { background: '#111827', borderColor: '#111827', color: '#fff' },

  // preview
  preview:    { position: 'relative', height: 170, borderRadius: 12, overflow: 'hidden' },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  previewBar: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.65))', padding: '20px 12px 10px', display: 'flex', gap: 8, justifyContent: 'center' },
  pBtn:       { padding: '5px 14px', borderRadius: 7, border: 'none', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },

  submit: { height: 48, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', letterSpacing: '-0.01em', transition: 'opacity 0.15s' },
};
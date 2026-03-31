import { useState, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Container,
  Paper,
  Stack,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';

import { useCreateApplicantMutation } from '../../entities/applicant/applicantApi';

export default function ApplicantSubmitPage() {
  const [form, setForm] = useState({
    name: '',
    surname: '',
    patronymic: '',
    email: '',
    phone: '',
    photo: null as File | null,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openCameraDialog, setOpenCameraDialog] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [createApplicant, { isLoading }] = useCreateApplicantMutation();

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processPhoto(file);
    }
  };

  const processPhoto = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Размер фото не должен превышать 5MB');
      return;
    }

    setForm((prev) => ({ ...prev, photo: file }));
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
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

  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, photo: null }));
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setError(null);

      const requestData = {
        name: form.name,
        surname: form.surname,
        patronymic: form.patronymic || undefined,
        email: form.email,
        phone: form.phone || undefined,
        photo: form.photo ? await fileToBase64(form.photo) : undefined,
      };
      console.log(requestData);
      await createApplicant(requestData).unwrap();

      setMessage(`Заявка принята. Проверьте почту ${form.email}`);

      // Сброс формы
      setForm({ name: '', surname: '', patronymic: '', email: '', phone: '', photo: null });
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
      }
    } catch {
      setError('Ошибка отправки. Проверьте данные.');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const result = reader.result as string;

        // 🔥 Убираем префикс
        const base64 = result.split(',')[1];

        resolve(base64);
      };

      reader.onerror = (error) => reject(error);
    });
  };

  return (
      <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex',
            alignItems: 'center',
            py: 4,
          }}
      >
        <Container maxWidth="lg">
          <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 6,
                alignItems: 'center',
              }}
          >
            {/* Левая часть — лендинг */}
            <Box>
              <Typography
                  variant="h2"
                  fontWeight={700}
                  color="white"
                  sx={{ lineHeight: 1.2 }}
              >
                inVision U
              </Typography>

              <Typography
                  variant="h5"
                  color="grey.300"
                  sx={{ mt: 2, maxWidth: 400 }}
              >
                Построй карьеру в IT. Пройди отбор и получи доступ к обучению.
              </Typography>

              <Typography
                  variant="body1"
                  color="grey.400"
                  sx={{ mt: 3, maxWidth: 420 }}
              >
                Заполни заявку — мы отправим ссылку для собеседования на email.
              </Typography>
            </Box>

            {/* Правая часть — форма */}
            <Paper
                elevation={6}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  backdropFilter: 'blur(10px)',
                }}
            >
              <Stack spacing={2}>
                <Typography variant="h5" fontWeight={600}>
                  Подать заявку
                </Typography>

                {message && <Alert severity="success">{message}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                          label="Имя"
                          value={form.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          required
                          fullWidth
                      />
                      <TextField
                          label="Фамилия"
                          value={form.surname}
                          onChange={(e) => handleChange('surname', e.target.value)}
                          required
                          fullWidth
                      />
                      <TextField
                          label="Отчество"
                          value={form.patronymic}
                          onChange={(e) => handleChange('patronymic', e.target.value)}
                          fullWidth
                      />
                    </Stack>

                    <TextField
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        fullWidth
                    />

                    <TextField
                        label="Телефон"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        fullWidth
                    />

                    {/* Блок фото */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                        Фото профиля
                      </Typography>

                      <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleFileSelect}
                      />

                      {!photoPreview ? (
                          <Box
                              sx={{
                                width: '100%',
                                height: 200,
                                border: '2px dashed',
                                borderColor: 'divider',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                bgcolor: 'action.hover',
                                cursor: 'pointer',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  bgcolor: 'action.selected',
                                },
                              }}
                              onClick={() => fileInputRef.current?.click()} // клик по всей зоне
                          >
                            <Fab size="medium" color="primary" sx={{ boxShadow: 0 }}>
                              <AddPhotoAlternateIcon />
                            </Fab>
                            <Fab
                                size="medium"
                                color="secondary"
                                onClick={handleOpenCameraDialog}
                                sx={{ boxShadow: 0 }}
                            >
                              <CameraAltIcon />
                            </Fab>
                          </Box>
                      ) : (
                          <Box
                              sx={{
                                position: 'relative',
                                width: '100%',
                                height: 200,
                                borderRadius: 2,
                                overflow: 'hidden',
                                bgcolor: 'grey.100',
                              }}
                          >
                            <img
                                src={photoPreview}
                                alt="Preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <IconButton
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  bgcolor: 'rgba(0,0,0,0.5)',
                                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                                }}
                                onClick={handleRemovePhoto}
                            >
                              <CloseIcon sx={{ color: 'white' }} />
                            </IconButton>
                            <Button
                                variant="contained"
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  bottom: 8,
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                  '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
                                }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                              Изменить
                            </Button>
                          </Box>
                      )}
                    </Box>

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        sx={{ mt: 1, py: 1.5, borderRadius: 2, fontWeight: 600 }}
                    >
                      {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Отправить заявку'}
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Container>

        {/* Диалог камеры */}
        <Dialog
            open={openCameraDialog}
            onClose={handleCloseCameraDialog}
            maxWidth="md"
            fullWidth
        >
          <DialogTitle>
            Сделать фото
            <IconButton
                onClick={handleCloseCameraDialog}
                sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ position: 'relative', width: '100%' }}>
              <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    display: isCameraOpen ? 'block' : 'none',
                  }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
                variant="contained"
                startIcon={<CameraAltIcon />}
                onClick={capturePhoto}
                disabled={!isCameraOpen}
            >
              Сделать фото
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}
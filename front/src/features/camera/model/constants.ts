import type { FaceStatus } from './types';

export const FACE_STATUS: Record<FaceStatus, { label: string; dot: string }> = {
  idle:     { label: 'Ожидание',         dot: '#6b7280' },
  checking: { label: 'Ожидание',         dot: '#6b7280' },
  ok:       { label: 'Лицо найдено',    dot: '#22c55e' },
  no_face:  { label: 'Лицо не найдено', dot: '#ef4444' },
  error:    { label: 'Ошибка',           dot: '#ef4444' },
};

export const CAM_SIZES = [100, 150, 300, 450];
export const MAX_FAILS = 3;
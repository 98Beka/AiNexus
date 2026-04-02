import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' },
  card: { background: '#fff', borderRadius: 20, padding: 32, maxWidth: 460, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 },
  iconWrap: { width: 56, height: 56, borderRadius: '50%', background: '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 800, color: '#111827' },
  sub: { fontSize: 13, color: '#6b7280', textAlign: 'center' },
  infoBlock: { width: '100%', background: '#f9fafb', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 },
  infoRow: { display: 'flex', gap: 10 },
  infoIcon: { fontSize: 15 },
  infoText: { fontSize: 12, color: '#374151' },
  camSection: { width: '100%', display: 'flex', flexDirection: 'column', gap: 10 },
  camTitle: { fontSize: 12, fontWeight: 700, color: '#6b7280' },
  videoWrap: { width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', background: '#000', position: 'relative' },
  video: { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' },
  camOverlay: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  camBadgeOk: { background: '#22c55e', color: '#fff', padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700 },
  camBadgeFail: { background: '#ef4444', color: '#fff', padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700 },
  checkBtn: { width: '100%', height: 40, borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btn: { width: '100%', height: 48, borderRadius: 12, border: 'none', background: '#111827', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
};
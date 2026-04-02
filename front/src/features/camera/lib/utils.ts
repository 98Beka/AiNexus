export function captureFrameBase64(video: HTMLVideoElement, canvas: HTMLCanvasElement): string {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
}
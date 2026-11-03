import { frames, SPRITE_H, SPRITE_W } from '../engine/playerSprite';

/** The idle player standing in the hero; blinks every 3.2 s. Hidden while playing. */
export function mountHeroSprite(canvas: HTMLCanvasElement, isPlaying: () => boolean): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const draw = (blink: boolean) => {
    const d = Math.max(1, Math.round(devicePixelRatio || 1));
    canvas.width = SPRITE_W * 3 * d;
    canvas.height = SPRITE_H * 3 * d;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage((blink ? frames().blink : frames().idle)[0], 0, 0, canvas.width, canvas.height);
  };
  draw(false);
  setInterval(() => {
    if (isPlaying() || document.hidden) return;
    draw(true);
    setTimeout(() => draw(false), 130);
  }, 3200);
  addEventListener('resize', () => draw(false));
}

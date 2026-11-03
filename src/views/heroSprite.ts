import sheet from '../content/player.json' with { type: 'json' };
import { asset } from '../lib/asset';

/** The idle player standing in the hero (idle frames of the player sheet); blinks every 3.2 s. Hidden while playing. */
export function mountHeroSprite(canvas: HTMLCanvasElement, isPlaying: () => boolean): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = new Image();
  img.src = asset('/sprites/player.png');
  const { frameW: w, frameH: h } = sheet;
  const draw = (blink: boolean) => {
    if (!img.complete || !img.naturalWidth) return;
    const f = sheet.anims.idle[blink ? 1 : 0] ?? 0;
    const d = Math.max(1, Math.round(devicePixelRatio || 1));
    canvas.width = w * 3 * d;
    canvas.height = h * 3 * d;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, f * w, 0, w, h, 0, 0, canvas.width, canvas.height);
  };
  img.onload = () => draw(false);
  setInterval(() => {
    if (isPlaying() || document.hidden) return;
    draw(true);
    setTimeout(() => draw(false), 130);
  }, 3200);
  addEventListener('resize', () => draw(false));
}

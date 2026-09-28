import {
  PHOTO_THEMES,
  DEFAULT_SAMPLE_SHOTS,
  type PhotoStripOptions,
  type PhotoTheme,
} from '../types/photobooth.types';

// Helper to load image safely into HTMLImageElement
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function createFallbackImage(): HTMLImageElement {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fce7f3';
  ctx.fillRect(0, 0, 400, 400);
  ctx.fillStyle = '#ec4899';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PUNPON', 200, 200);

  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

// Draw centered cropped image within target box
function drawImageCenterCrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  radius?: number
) {
  ctx.save();
  if (radius && radius > 0) {
    drawRoundedRect(ctx, dx, dy, dw, dh, radius);
    ctx.clip();
  }

  const targetAspect = dw / dh;
  const imgAspect = img.width / img.height;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imgAspect > targetAspect) {
    sw = img.height * targetAspect;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / targetAspect;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.restore();
}

// Memory cache for prepared frame overlays with transparent cutouts
const frameCache = new Map<string, HTMLCanvasElement>();

async function getTransparentFrameCanvas(theme: PhotoTheme): Promise<HTMLCanvasElement> {
  if (frameCache.has(theme.id)) {
    return frameCache.get(theme.id)!;
  }

  const frameImg = await loadImage(theme.framePath);
  const w = frameImg.naturalWidth || frameImg.width;
  const h = frameImg.naturalHeight || frameImg.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(frameImg, 0, 0);

  // If the frame image is a JPG with white cutouts, key out the cutout boxes to transparent
  const frameData = ctx.getImageData(0, 0, w, h);
  const data = frameData.data;

  for (const cutout of theme.cutouts) {
    const boxX = Math.floor(cutout.x * w);
    const boxY = Math.floor(cutout.y * h);
    const boxW = Math.ceil(cutout.w * w);
    const boxH = Math.ceil(cutout.h * h);

    for (let y = boxY; y < boxY + boxH && y < h; y++) {
      for (let x = boxX; x < boxX + boxW && x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        // Near-white cutout area in frame image is made transparent
        if (r >= 238 && g >= 238 && b >= 238) {
          data[idx + 3] = 0;
        }
      }
    }
  }

  ctx.putImageData(frameData, 0, 0);
  frameCache.set(theme.id, canvas);
  return canvas;
}

/**
 * Bespoke renderer for Punpon Sticker:
 * - Smooth vertical linear gradient from pure White at top down to Mint Green at bottom
 * - Large, prominent dynamic custom text at the top (24px+ equivalent)
 * - 3 clean, crisp photo cutouts with pure white framing borders and soft drop shadows
 * - Punpon Official Logo + #PunponCGM48 hashtag at the bottom
 */
async function generatePunponMintStrip(
  userPhotos: HTMLImageElement[],
  options: PhotoStripOptions
): Promise<string> {
  const w = 1184;
  const h = 3568;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // 1. Background: Solid Green rgb(73, 197, 168)
  ctx.fillStyle = 'rgb(73, 197, 168)';
  ctx.fillRect(0, 0, w, h);

  // 2. Top Header: User-specified dynamic custom text in white (ใหญ่ 32px)
  const topText = (options.caption || 'PUNPON CGM48').trim();
  ctx.save();
  ctx.font = 'bold 78px "Prompt", "Mitr", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(topText, w / 2, Math.round(0.04 * h), 940);
  ctx.restore();

  // 3. 3 Photo Cutouts with crisp white border and soft rounded corners
  const theme = PHOTO_THEMES.punpon_sticker;
  theme.cutouts.forEach((cutout, idx) => {
    const photo = userPhotos[idx];
    const dx = Math.round(cutout.x * w);
    const dy = Math.round(cutout.y * h);
    const dw = Math.round(cutout.w * w);
    const dh = Math.round(cutout.h * h);
    const r = cutout.radius || 24;

    // Soft drop shadow under the photo frame
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#ffffff';
    drawRoundedRect(ctx, dx, dy, dw, dh, r);
    ctx.fill();
    ctx.restore();

    // Draw photo inside
    if (photo) {
      drawImageCenterCrop(ctx, photo, dx, dy, dw, dh, r);
    }

    // Crisp pure white framing border
    ctx.save();
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#ffffff';
    drawRoundedRect(ctx, dx, dy, dw, dh, r);
    ctx.stroke();
    ctx.restore();
  });

  // 4. Bottom Area: Punpon Logo centered + #PunponCGM48 hashtag
  try {
    const logoImg = await loadImage('/punpon-logo.png').catch(() => null);
    if (logoImg) {
      const logoSize = 320;
      const logoX = (w - logoSize) / 2;
      const logoY = Math.round(0.838 * h);
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    }
  } catch (err) {
    console.warn('Failed to load punpon logo:', err);
  }

  // Draw #PunponCGM48 text below the logo in white (ใหญ่ 32px)
  ctx.save();
  ctx.font = 'bold 78px "Prompt", "Mitr", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('#PunponCGM48', w / 2, Math.round(0.96 * h), 940);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Universal Photo Strip Generator
 * Composites user photos behind the reference frame overlay.
 * Dynamic: theme changes require only image path and cutout coordinates.
 */
export async function generatePhotoStrip(
  shots: string[],
  options: PhotoStripOptions
): Promise<string> {
  const theme = PHOTO_THEMES[options.themeId] || PHOTO_THEMES.punpon_sticker;

  // Resolve 3 distinct photo sources (guarantee no duplicate photos across slots)
  const s0 = shots[0] || DEFAULT_SAMPLE_SHOTS[0];
  const s1 = shots[1] && shots[1] !== s0 ? shots[1] : DEFAULT_SAMPLE_SHOTS[1];
  const s2 = shots[2] && shots[2] !== s0 && shots[2] !== s1 ? shots[2] : DEFAULT_SAMPLE_SHOTS[2];
  const resolvedSources: string[] = [s0, s1, s2];

  // If theme is punpon_sticker, render the bespoke White-to-Mint gradient strip
  if (theme.id === 'punpon_sticker') {
    const userPhotos = await Promise.all(
      resolvedSources.map((src, idx) =>
        loadImage(src).catch(() =>
          loadImage(DEFAULT_SAMPLE_SHOTS[idx]).catch(() => createFallbackImage())
        )
      )
    );
    return generatePunponMintStrip(userPhotos, options);
  }

  // 1. Load transparent frame canvas + user photos in parallel
  const [frameCanvas, ...userPhotos] = await Promise.all([
    getTransparentFrameCanvas(theme),
    ...resolvedSources.map((src, idx) =>
      loadImage(src).catch(() =>
        loadImage(DEFAULT_SAMPLE_SHOTS[idx]).catch(() => createFallbackImage())
      )
    ),
  ]);

  // 2. Create master canvas with exact frame dimensions
  const w = frameCanvas.width;
  const h = frameCanvas.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // 3. Fill solid white background underneath
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // 4. Draw user photos at each cutout position (cropped to fit full size without seams)
  theme.cutouts.forEach((cutout, idx) => {
    const photo = userPhotos[idx];
    if (photo) {
      const bleed = 4;
      const dx = Math.floor(cutout.x * w) - bleed;
      const dy = Math.floor(cutout.y * h) - bleed;
      const dw = Math.ceil(cutout.w * w) + bleed * 2;
      const dh = Math.ceil(cutout.h * h) + bleed * 2;
      drawImageCenterCrop(ctx, photo, dx, dy, dw, dh, cutout.radius);
    }
  });

  // 5. Draw frame overlay ON TOP of the photos
  ctx.drawImage(frameCanvas, 0, 0);

  // 6. Draw dynamic caption ONLY if theme allows custom caption
  if (theme.allowCustomCaption && theme.captionArea && options.caption) {
    const ca = theme.captionArea;
    ctx.save();
    ctx.fillStyle = ca.color;
    ctx.font = `bold ${ca.fontSize}px "Mitr", "Prompt", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(options.caption, ca.x * w, ca.y * h, ca.maxWidth);
    ctx.restore();
  }

  return canvas.toDataURL('image/jpeg', 0.92);
}

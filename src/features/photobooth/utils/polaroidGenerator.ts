export interface PolaroidOptions {
  caption?: string;
  subCaption?: string;
}

export async function generatePolaroid(
  imageSource: string,
  options: PolaroidOptions = {}
): Promise<string> {
  const {
    caption = 'PUNPON CGM48 AFTER PARTY',
    subCaption = `${new Date().toLocaleDateString('th-TH')} • Fan-Made Keepsake`,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        // Classic Polaroid Dimensions (720w x 860h)
        const canvasWidth = 720;
        const canvasHeight = 860;
        const marginX = 40;
        const marginTop = 40;
        const photoWidth = 640;
        const photoHeight = 640;

        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        // 1. Polaroid White Paper Card Base
        ctx.fillStyle = '#faf9f6';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Subtle paper texture border
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#e2e8f0';
        ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

        // 2. Draw Captured Photo (Centered Crop)
        const imgAspect = img.width / img.height;
        let sWidth = img.width;
        let sHeight = img.height;
        let sx = 0;
        let sy = 0;

        if (imgAspect > 1) {
          sWidth = img.height;
          sx = (img.width - sWidth) / 2;
        } else {
          sHeight = img.width;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, marginX, marginTop, photoWidth, photoHeight);

        // 3. Vintage Film Vignette & Warm Tint Overlay
        const vignette = ctx.createRadialGradient(
          marginX + photoWidth / 2,
          marginTop + photoHeight / 2,
          photoWidth * 0.35,
          marginX + photoWidth / 2,
          marginTop + photoHeight / 2,
          photoWidth * 0.72
        );
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(15, 23, 42, 0.28)');
        ctx.fillStyle = vignette;
        ctx.fillRect(marginX, marginTop, photoWidth, photoHeight);

        // Warm after-party golden sheen
        ctx.fillStyle = 'rgba(251, 191, 36, 0.05)';
        ctx.fillRect(marginX, marginTop, photoWidth, photoHeight);

        // Photo inner border
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.strokeRect(marginX, marginTop, photoWidth, photoHeight);

        // 4. Decorative Tape on Top Center
        ctx.save();
        ctx.translate(canvasWidth / 2, 25);
        ctx.rotate(-0.03);
        ctx.fillStyle = 'rgba(52, 211, 153, 0.55)';
        ctx.fillRect(-70, -12, 140, 24);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-70, -12, 140, 24);
        ctx.restore();

        // 5. Bottom Chin Captions
        // Main Title
        ctx.fillStyle = '#0f172a';
        ctx.font = '800 28px "Mitr", "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(caption, canvasWidth / 2, 725);

        // Subtitle & Date
        ctx.fillStyle = '#64748b';
        ctx.font = '500 16px "Prompt", "Mitr", sans-serif';
        ctx.fillText(subCaption, canvasWidth / 2, 765);

        // Stamp on bottom right
        ctx.fillStyle = '#f59e0b';
        ctx.font = '700 13px "Mitr", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('PUNPON FANCLUB', canvasWidth - marginX - 10, 810);

        // Return high-res PNG
        resolve(canvas.toDataURL('image/png', 1.0));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load snapshot image'));
    img.src = imageSource;
  });
}

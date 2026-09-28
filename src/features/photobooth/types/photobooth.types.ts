export type PhotoThemeId = 'punpon_sticker' | 'ge_sticker' | 'afterschool';

export const DEFAULT_SAMPLE_SHOTS: [string, string, string] = [
  '/punpon-shot1.png',
  '/punpon-shot2.png',
  '/punpon-shot3.png',
];

export interface PhotoCutout {
  x: number; // % of canvas width (0-1)
  y: number; // % of canvas height (0-1)
  w: number; // % of canvas width (0-1)
  h: number; // % of canvas height (0-1)
  radius?: number; // optional corner radius
}

export interface CaptionArea {
  x: number; // Center X % of width (0-1)
  y: number; // Center Y % of height (0-1)
  maxWidth: number; // Max text width in px
  fontSize: number;
  color: string;
}

export interface PhotoTheme {
  id: PhotoThemeId;
  name: string;
  subtitle: string;
  badge: string;
  primaryColor: string;
  accentColor: string;
  framePath: string;
  allowCustomCaption: boolean;
  cutouts: PhotoCutout[];
  captionArea?: CaptionArea;
}

export interface PhotoStripOptions {
  themeId: PhotoThemeId;
  caption?: string;
  subCaption?: string;
}

export const PHOTO_THEMES: Record<PhotoThemeId, PhotoTheme> = {
  punpon_sticker: {
    id: 'punpon_sticker',
    name: 'Punpon Sticker',
    subtitle: 'โทนเขียวมิ้นท์ #PunponCGM48',
    badge: 'MINT',
    primaryColor: '#49c5a8',
    accentColor: '#ffffff',
    framePath: '/ref/punpon_sticker.jpg',
    allowCustomCaption: true,
    cutouts: [
      { x: 0.1115, y: 0.0785, w: 0.777, h: 0.2298, radius: 24 },
      { x: 0.1115, y: 0.3307, w: 0.777, h: 0.2298, radius: 24 },
      { x: 0.1115, y: 0.583, w: 0.777, h: 0.2298, radius: 24 },
    ],
    captionArea: {
      x: 0.5,
      y: 0.04,
      maxWidth: 940,
      fontSize: 78,
      color: '#ffffff',
    },
  },
  ge_sticker: {
    id: 'ge_sticker',
    name: 'GE 2026',
    subtitle: 'General Election พลุทองหรูหรา',
    badge: 'GE 2026',
    primaryColor: '#c8963e',
    accentColor: '#e8b64a',
    framePath: '/ref/ge_sticker.jpg',
    allowCustomCaption: false,
    cutouts: [
      { x: 0.1014, y: 0.2958, w: 0.7981, h: 0.1702 },
      { x: 0.1014, y: 0.5148, w: 0.7981, h: 0.1702 },
      { x: 0.1014, y: 0.7338, w: 0.7981, h: 0.1702 },
    ],
  },
  afterschool: {
    id: 'afterschool',
    name: 'After School',
    subtitle: 'ปาร์ตี้โรงเรียนสดใส',
    badge: 'SCHOOL',
    primaryColor: '#c490d8',
    accentColor: '#a855f7',
    framePath: '/ref/afterschool.jpg',
    allowCustomCaption: false,
    cutouts: [
      { x: 0.1985, y: 0.1724, w: 0.6039, h: 0.2284 },
      { x: 0.1985, y: 0.4148, w: 0.6039, h: 0.2242 },
      { x: 0.1985, y: 0.6502, w: 0.6039, h: 0.2438 },
    ],
  },
};

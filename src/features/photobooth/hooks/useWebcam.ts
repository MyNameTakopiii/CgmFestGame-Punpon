import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
  facingMode: 'user' | 'environment';
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  switchCamera: () => Promise<void>;
  captureSnapshot: (maxWidth?: number, quality?: number) => string | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string[]>;
}

export function useWebcam(): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startingRef = useRef<boolean>(false);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const stopCamera = useCallback(() => {
    startingRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (startingRef.current) return;
    startingRef.current = true;
    setError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('เบราว์เซอร์นี้ไม่รองรับการเปิดกล้องเว็บแคม หรือต้องเปิดผ่าน https / localhost');
      startingRef.current = false;
      return;
    }

    // Clean up any existing stream before starting a new one
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }

    let mediaStream: MediaStream | null = null;

    // Strategy 1: Request 720p/1080p ideal stream without restrictive 'min' constraints
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode ? { ideal: facingMode } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (err1) {
      console.warn(
        'Advanced camera constraints failed, attempting fallback { video: true }...',
        err1
      );
      // Strategy 2: Absolute minimal constraint fallback
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (err2) {
        startingRef.current = false;
        const err = err2 as Error;
        const name = err.name || '';
        let msg = 'ไม่สามารถเปิดกล้องได้: ' + (err.message || 'เกิดข้อผิดพลาด');

        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          msg = 'กรุณากด "อนุญาต (Allow)" ให้เข้าถึงกล้องที่แถบ URL หรือในการตั้งค่าเบราว์เซอร์';
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          msg = 'ไม่พบอุปกรณ์กล้องเว็บแคมบนเครื่องนี้';
        } else if (name === 'NotReadableError' || name === 'TrackStartError') {
          msg =
            'กล้องกำลังถูกใช้งานโดยโปรแกรมอื่น (เช่น Zoom, Teams, OBS) กรุณาปิดโปรแกรมอื่นแล้วลองใหม่';
        } else if (name === 'OverconstrainedError') {
          msg = 'กล้องไม่รองรับรูปแบบความละเอียดที่กำหนด';
        }

        setError(msg);
        setIsActive(false);
        return;
      }
    }

    streamRef.current = mediaStream;
    setStream(mediaStream);
    setIsActive(true);
    startingRef.current = false;

    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(() => {});
    }
  }, [facingMode]);

  const switchCamera = useCallback(async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setError(null);

    // Stop current stream tracks cleanly before requesting the other camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }

    setFacingMode(nextMode);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return;
    }

    let mediaStream: MediaStream | null = null;
    try {
      // 1. Try exact facingMode constraint (required for many Android/iOS devices to switch)
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: nextMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch {
      try {
        // 2. Fallback to ideal facingMode
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: nextMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err) {
        console.warn('Switch camera constraint fallback, trying any video stream...', err);
        try {
          // 3. Fallback to basic video stream
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (finalErr) {
          console.error('Failed to switch camera completely:', finalErr);
          setError('ไม่สามารถสลับกล้องได้');
          return;
        }
      }
    }

    streamRef.current = mediaStream;
    setStream(mediaStream);
    setIsActive(true);

    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(() => {});
    }
  }, [facingMode]);

  // Keep video element in sync whenever stream updates
  useEffect(() => {
    if (stream && videoRef.current && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const captureSnapshot = useCallback(
    (maxWidth?: number, quality?: number): string | null => {
      if (!videoRef.current) return null;
      const video = videoRef.current;
      const rawWidth = video.videoWidth || 1280;
      const rawHeight = video.videoHeight || 720;

      let targetWidth = rawWidth;
      let targetHeight = rawHeight;

      if (maxWidth && targetWidth > maxWidth) {
        targetHeight = Math.round((rawHeight * maxWidth) / rawWidth);
        targetWidth = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Flip horizontally if front camera for natural mirror reflection
      if (facingMode === 'user') {
        ctx.translate(targetWidth, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      return canvas.toDataURL('image/jpeg', quality ?? 0.82);
    },
    [facingMode]
  );

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>): Promise<string[]> => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return [];

      const readPromises = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      });

      const results = await Promise.all(readPromises);
      return results.filter(Boolean);
    },
    []
  );

  return {
    videoRef,
    stream,
    isActive,
    error,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    captureSnapshot,
    handleFileUpload,
  };
}

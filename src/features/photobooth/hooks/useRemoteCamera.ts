import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { type DataConnection } from 'peerjs';

const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' },
    ],
  },
};

export interface RemoteMessage {
  type: 'CONNECT' | 'READY' | 'SNAP' | 'COMPLETE';
  slot?: number;
  image?: string;
  shots?: string[];
}

export interface UseRemoteCameraHostReturn {
  roomId: string;
  pairingUrl: string;
  isConnected: boolean;
  receivedShots: string[];
  latestReceivedIndex: number | null;
  lastError: string | null;
  resetConnection: () => void;
}

/**
 * Hook used on the Computer/Host to receive snaps from the mobile companion camera
 */
export function useRemoteCameraHost(
  onAllShotsReceived?: (shots: string[]) => void
): UseRemoteCameraHostReturn {
  const [roomId] = useState(() => Math.random().toString(36).substring(2, 8));
  const [isConnected, setIsConnected] = useState(false);
  const [receivedShots, setReceivedShots] = useState<string[]>([]);
  const [latestReceivedIndex, setLatestReceivedIndex] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const completedRef = useRef(false);

  // Keep callback in ref so changes don't re-trigger peer destruction
  const onAllShotsReceivedRef = useRef(onAllShotsReceived);
  useEffect(() => {
    onAllShotsReceivedRef.current = onAllShotsReceived;
  }, [onAllShotsReceived]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pairingUrl = `${origin}/?mode=camera&room=${roomId}`;

  const triggerComplete = useCallback((shots: string[]) => {
    if (completedRef.current) return;
    completedRef.current = true;
    setReceivedShots(shots);
    onAllShotsReceivedRef.current?.(shots);
  }, []);

  const handleIncomingMessage = useCallback(
    (msg: RemoteMessage) => {
      if (msg.type === 'CONNECT' || msg.type === 'READY') {
        setIsConnected(true);
      } else if (msg.type === 'SNAP' && msg.image !== undefined && msg.slot !== undefined) {
        setIsConnected(true);
        setLatestReceivedIndex(msg.slot);
        setReceivedShots((prev) => {
          const next = [...prev];
          next[msg.slot!] = msg.image!;
          if (next[0] && next[1] && next[2]) {
            setTimeout(() => triggerComplete([next[0], next[1], next[2]]), 300);
          }
          return next;
        });
      } else if (msg.type === 'COMPLETE') {
        if (msg.shots && msg.shots.length >= 3) {
          triggerComplete(msg.shots);
        } else {
          setReceivedShots((prev) => {
            if (prev[0] && prev[1] && prev[2]) {
              triggerComplete([prev[0], prev[1], prev[2]]);
            }
            return prev;
          });
        }
      }
    },
    [triggerComplete]
  );

  useEffect(() => {
    // 1. BroadcastChannel for local/multi-tab instantaneous sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(`punpon_room_${roomId}`);
        channelRef.current = bc;
        bc.onmessage = (event) => {
          handleIncomingMessage(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }

    // 2. PeerJS with STUN servers
    try {
      const peer = new Peer(`punpon-host-${roomId}`, PEER_CONFIG);
      peerRef.current = peer;

      peer.on('open', () => {
        // Host ready
      });

      peer.on('connection', (conn) => {
        connRef.current = conn;
        setIsConnected(true);

        conn.on('data', (data) => {
          handleIncomingMessage(data as RemoteMessage);
        });

        conn.on('close', () => {
          setIsConnected(false);
        });

        conn.on('error', (err) => {
          console.warn('Host connection notice:', err);
        });
      });

      peer.on('error', (err) => {
        console.warn('Host PeerJS notice:', err);
        setLastError(err.message || 'PeerJS notice');
      });
    } catch (err) {
      console.warn('PeerJS init failed:', err);
    }

    // 3. Cloudinary Cloud Sync Poller Fallback (Guaranteed delivery if WebRTC P2P NAT fails)
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dx7p5ij0z';
    const pollInterval = setInterval(() => {
      if (completedRef.current) {
        clearInterval(pollInterval);
        return;
      }
      // Check if slot 2 has been uploaded to Cloudinary
      const slot2Url = `https://res.cloudinary.com/${cloudName}/image/upload/punpon_${roomId}_s2.jpg`;
      const img = new Image();
      img.onload = () => {
        if (!completedRef.current) {
          const s0 = `https://res.cloudinary.com/${cloudName}/image/upload/punpon_${roomId}_s0.jpg`;
          const s1 = `https://res.cloudinary.com/${cloudName}/image/upload/punpon_${roomId}_s1.jpg`;
          const s2 = slot2Url;
          triggerComplete([s0, s1, s2]);
          clearInterval(pollInterval);
        }
      };
      img.src = `${slot2Url}?t=${Date.now()}`;
    }, 2500);

    return () => {
      clearInterval(pollInterval);
      channelRef.current?.close();
      peerRef.current?.destroy();
    };
  }, [roomId, handleIncomingMessage, triggerComplete]);

  const resetConnection = useCallback(() => {
    completedRef.current = false;
    setReceivedShots([]);
    setLatestReceivedIndex(null);
    setIsConnected(false);
    setLastError(null);
  }, []);

  return {
    roomId,
    pairingUrl,
    isConnected,
    receivedShots,
    latestReceivedIndex,
    lastError,
    resetConnection,
  };
}

export interface UseRemoteCameraClientReturn {
  isConnected: boolean;
  sendSnap: (slot: number, imageDataUrl: string) => void;
  sendComplete: (allShots?: string[]) => void;
  sendBatchShots: (allShots: string[]) => Promise<boolean>;
}

/**
 * Hook used on the Mobile Phone to send captured pictures to the Host
 */
export function useRemoteCameraClient(roomId: string): UseRemoteCameraClientReturn {
  const [isConnected, setIsConnected] = useState(false);
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // 1. BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(`punpon_room_${roomId}`);
        channelRef.current = bc;
        bc.postMessage({ type: 'CONNECT' });
        setIsConnected(true);
      } catch {
        // ignore
      }
    }

    // 2. PeerJS with STUN configuration
    try {
      const clientPeer = new Peer(PEER_CONFIG);
      peerRef.current = clientPeer;

      clientPeer.on('open', () => {
        const conn = clientPeer.connect(`punpon-host-${roomId}`, { reliable: true });
        connRef.current = conn;

        conn.on('open', () => {
          setIsConnected(true);
          conn.send({ type: 'READY' });
        });

        conn.on('close', () => {
          setIsConnected(false);
        });

        conn.on('error', (err) => {
          console.warn('Client connection error:', err);
        });
      });

      clientPeer.on('error', (err) => {
        console.warn('Client PeerJS notice:', err);
      });
    } catch (err) {
      console.warn('PeerJS client error:', err);
    }

    return () => {
      channelRef.current?.close();
      peerRef.current?.destroy();
    };
  }, [roomId]);

  const sendSnap = useCallback((slot: number, imageDataUrl: string) => {
    const msg: RemoteMessage = { type: 'SNAP', slot, image: imageDataUrl };
    channelRef.current?.postMessage(msg);
    if (connRef.current && connRef.current.open) {
      try {
        connRef.current.send(msg);
      } catch (err) {
        console.warn('sendSnap WebRTC error:', err);
      }
    }
  }, []);

  const sendComplete = useCallback((allShots?: string[]) => {
    const msg: RemoteMessage = { type: 'COMPLETE', shots: allShots };
    channelRef.current?.postMessage(msg);
    if (connRef.current && connRef.current.open) {
      try {
        connRef.current.send(msg);
      } catch (err) {
        console.warn('sendComplete WebRTC error:', err);
      }
    }
  }, []);

  const sendBatchShots = useCallback(
    async (allShots: string[]): Promise<boolean> => {
      // 1. Instantly dispatch over WebRTC and BroadcastChannel
      sendComplete(allShots);

      // 2. Parallel upload to Cloudinary for guaranteed delivery across NAT / 4G
      try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dx7p5ij0z';
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'photobooth_preset';

        const uploads = allShots.map(async (shot, idx) => {
          const formData = new FormData();
          formData.append('file', shot);
          formData.append('upload_preset', uploadPreset);
          formData.append('public_id', `punpon_${roomId}_s${idx}`);

          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
          });
          return res.ok;
        });

        await Promise.all(uploads);
        return true;
      } catch (err) {
        console.warn('sendBatchShots Cloudinary sync notice:', err);
        return false;
      }
    },
    [roomId, sendComplete]
  );

  return {
    isConnected,
    sendSnap,
    sendComplete,
    sendBatchShots,
  };
}

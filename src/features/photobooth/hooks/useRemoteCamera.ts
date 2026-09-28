import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { type DataConnection } from 'peerjs';

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

  // Keep callback in ref so changes don't re-trigger peer destruction
  const onAllShotsReceivedRef = useRef(onAllShotsReceived);
  useEffect(() => {
    onAllShotsReceivedRef.current = onAllShotsReceived;
  }, [onAllShotsReceived]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pairingUrl = `${origin}/?mode=camera&room=${roomId}`;

  const handleIncomingMessage = useCallback((msg: RemoteMessage) => {
    if (msg.type === 'CONNECT' || msg.type === 'READY') {
      setIsConnected(true);
    } else if (msg.type === 'SNAP' && msg.image !== undefined && msg.slot !== undefined) {
      setIsConnected(true);
      setLatestReceivedIndex(msg.slot);
      setReceivedShots((prev) => {
        const next = [...prev];
        next[msg.slot!] = msg.image!;
        // If all 3 slots are filled, trigger completion automatically
        if (next[0] && next[1] && next[2]) {
          setTimeout(() => {
            onAllShotsReceivedRef.current?.([next[0], next[1], next[2]]);
          }, 350);
        }
        return next;
      });
    } else if (msg.type === 'COMPLETE') {
      setReceivedShots((prev) => {
        const finalShots = msg.shots && msg.shots.length >= 3 ? msg.shots : prev;
        if (finalShots[0] && finalShots[1] && finalShots[2]) {
          onAllShotsReceivedRef.current?.([finalShots[0], finalShots[1], finalShots[2]]);
        }
        return finalShots;
      });
    }
  }, []);

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

    // 2. PeerJS for remote network WebRTC communication
    try {
      const peer = new Peer(`punpon-host-${roomId}`);
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

    return () => {
      channelRef.current?.close();
      peerRef.current?.destroy();
    };
  }, [roomId, handleIncomingMessage]);

  const resetConnection = useCallback(() => {
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

    // 2. PeerJS
    try {
      const clientPeer = new Peer();
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

  return {
    isConnected,
    sendSnap,
    sendComplete,
  };
}

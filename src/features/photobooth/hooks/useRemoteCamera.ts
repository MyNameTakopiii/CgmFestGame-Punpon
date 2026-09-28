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
  const [lastError, setLastError] = useState<string | null>(null);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pairingUrl = `${origin}/?mode=camera&room=${roomId}`;

  const handleIncomingMessage = useCallback(
    (msg: RemoteMessage) => {
      if (msg.type === 'CONNECT' || msg.type === 'READY') {
        setIsConnected(true);
      } else if (msg.type === 'SNAP' && msg.image !== undefined && msg.slot !== undefined) {
        setIsConnected(true);
        setReceivedShots((prev) => {
          const next = [...prev];
          next[msg.slot!] = msg.image!;
          return next;
        });
      } else if (msg.type === 'COMPLETE' && msg.shots && msg.shots.length >= 3) {
        setReceivedShots(msg.shots);
        onAllShotsReceived?.(msg.shots);
      }
    },
    [onAllShotsReceived]
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
      });

      peer.on('error', (err) => {
        console.warn('Host PeerJS notice:', err);
        // Do not crash, BroadcastChannel still works locally
      });
    } catch (err) {
      console.warn('PeerJS init failed:', err);
    }

    return () => {
      channelRef.current?.close();
      peerRef.current?.destroy();
    };
  }, [roomId, handleIncomingMessage]);

  const resetConnection = () => {
    setReceivedShots([]);
    setIsConnected(false);
    setLastError(null);
  };

  return {
    roomId,
    pairingUrl,
    isConnected,
    receivedShots,
    lastError,
    resetConnection,
  };
}

export interface UseRemoteCameraClientReturn {
  isConnected: boolean;
  sendSnap: (slot: number, imageDataUrl: string) => void;
  sendComplete: (allShots: string[]) => void;
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

  const sendSnap = (slot: number, imageDataUrl: string) => {
    const msg: RemoteMessage = { type: 'SNAP', slot, image: imageDataUrl };
    channelRef.current?.postMessage(msg);
    if (connRef.current && connRef.current.open) {
      connRef.current.send(msg);
    }
  };

  const sendComplete = (allShots: string[]) => {
    const msg: RemoteMessage = { type: 'COMPLETE', shots: allShots };
    channelRef.current?.postMessage(msg);
    if (connRef.current && connRef.current.open) {
      connRef.current.send(msg);
    }
  };

  return {
    isConnected,
    sendSnap,
    sendComplete,
  };
}

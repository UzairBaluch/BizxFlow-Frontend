import { io, type Socket } from 'socket.io-client';
import { getSocketOrigin } from '@/lib/apiOrigin';

let socket: Socket | null = null;

export type NotificationSocket = Socket;

const SOCKET_PATH =
  (import.meta.env.VITE_SOCKET_IO_PATH as string | undefined)?.trim() || '/socket.io';

/**
 * Real-time notification stream (**user** accessToken only; company JWT is rejected by the server).
 * Reconnect after token rotation: `disconnectNotificationSocket()` then `connectNotificationSocket(newToken)`.
 */
export function connectNotificationSocket(accessToken: string): Socket {
  disconnectNotificationSocket();
  const url = getSocketOrigin();
  socket = io(url, {
    path: SOCKET_PATH,
    auth: { token: accessToken },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: 8,
  });

  socket.on('connect', () => {
    if (import.meta.env.DEV) {
      console.info('[notifications socket] connected', url);
    }
  });

  socket.on('connect_error', (err: Error) => {
    if (import.meta.env.DEV) {
      console.warn('[notifications socket] connect_error', url, SOCKET_PATH, err.message);
    }
  });

  return socket;
}

export function disconnectNotificationSocket(): void {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
}

export function getNotificationSocket(): Socket | null {
  return socket;
}

import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : window.location.origin);

let socket = null;

export function initSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket serverga ulandi! Socket ID:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚡ Socket uzildi:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket ulanish xatosi:', err.message);
    });
  }
  return socket;
}

export function getSocket() {
  if (!socket) {
    return initSocket();
  }
  return socket;
}

export const socketService = {
  createRoom: ({ roomName, mode, language, user }) => {
    getSocket().emit('room:create', { roomName, mode, language, user });
  },

  joinRoom: (roomCode, user) => {
    getSocket().emit('room:join', { roomCode, user });
  },

  startRace: (roomCode) => {
    getSocket().emit('room:start_race', { roomCode });
  },

  sendProgress: ({ roomCode, progress, wpm, accuracy }) => {
    getSocket().emit('room:progress_update', { roomCode, progress, wpm, accuracy });
  },

  finishRace: ({ roomCode, wpm, accuracy, timeTaken }) => {
    getSocket().emit('room:player_finished', { roomCode, wpm, accuracy, timeTaken });
  },

  sendMessage: ({ roomCode, text }) => {
    getSocket().emit('room:send_message', { roomCode, text });
  },

  leaveRoom: () => {
    if (socket) {
      socket.emit('room:leave');
    }
  },
};

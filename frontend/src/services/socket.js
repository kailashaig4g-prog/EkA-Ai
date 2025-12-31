import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket.id);
      this.authenticate();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connected', (data) => {
      console.log('🔌 Server message:', data.message);
    });

    this.socket.on('authenticated', (data) => {
      if (data.status === 'success') {
        console.log('🔐 Socket authenticated for user:', data.user_id);
      } else {
        console.error('🔐 Socket auth failed:', data.message);
      }
    });

    // Set up default listeners
    this.socket.on('notification', (data) => {
      this.notifyListeners('notification', data);
    });

    this.socket.on('pipeline_update', (data) => {
      this.notifyListeners('pipeline_update', data);
    });

    this.socket.on('station_alert', (data) => {
      this.notifyListeners('station_alert', data);
    });
  }

  authenticate() {
    const token = useAuthStore.getState().token;
    if (token && this.socket?.connected) {
      this.socket.emit('authenticate', { token });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToPipeline(questionId) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_pipeline', { question_id: questionId });
    }
  }

  subscribeToStation(stationId) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_station', { station_id: stationId });
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
}

export const socketService = new SocketService();
export default socketService;

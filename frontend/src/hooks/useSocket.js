import { useEffect, useCallback } from 'react';
import socketService from '../services/socket';
import useNotificationStore from '../store/notificationStore';
import useAuthStore from '../store/authStore';
import { toast } from 'sonner';

export function useSocket() {
  const { isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, [isAuthenticated]);

  // Set up notification listener
  useEffect(() => {
    const unsubscribe = socketService.on('notification', (data) => {
      addNotification(data);
      
      // Show toast based on notification type
      const toastOptions = { duration: 5000 };
      
      switch (data.type) {
        case 'ai_response':
          toast.success(data.title, { description: data.message, ...toastOptions });
          break;
        case 'station_alert':
          toast.warning(data.title, { description: data.message, ...toastOptions });
          break;
        case 'ticket_escalation':
          toast.error(data.title, { description: data.message, ...toastOptions });
          break;
        default:
          toast.info(data.title, { description: data.message, ...toastOptions });
      }
    });

    return unsubscribe;
  }, [addNotification]);

  // Set up station alert listener
  useEffect(() => {
    const unsubscribe = socketService.on('station_alert', (data) => {
      addNotification({
        type: 'station_alert',
        title: `Station Alert: ${data.station_id}`,
        message: data.message,
        data: data,
      });
      
      toast.warning(`Station Alert`, {
        description: data.message,
        duration: 8000,
      });
    });

    return unsubscribe;
  }, [addNotification]);

  const subscribeToPipeline = useCallback((questionId) => {
    socketService.subscribeToPipeline(questionId);
  }, []);

  const subscribeToStation = useCallback((stationId) => {
    socketService.subscribeToStation(stationId);
  }, []);

  return {
    subscribeToPipeline,
    subscribeToStation,
  };
}

export function usePipelineUpdates(questionId, onUpdate) {
  useEffect(() => {
    if (!questionId) return;

    socketService.subscribeToPipeline(questionId);

    const unsubscribe = socketService.on('pipeline_update', (data) => {
      if (data.question_id === questionId) {
        onUpdate?.(data);
      }
    });

    return unsubscribe;
  }, [questionId, onUpdate]);
}

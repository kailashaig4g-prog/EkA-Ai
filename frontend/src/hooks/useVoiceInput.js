import { useState, useRef, useCallback } from 'react';
import config from '../config';

/**
 * Custom hook for voice input using Web Audio API and Whisper transcription
 */
export const useVoiceInput = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioChunksRef = useRef([]);

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      audioChunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      // Set up audio context for level visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);

      // Start audio level visualization
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  }, []);

  /**
   * Stop recording and return audio blob
   */
  const stopRecording = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorderRef.current.mimeType,
        });
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());

      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      setIsRecording(false);
      setAudioLevel(0);
    });
  }, []);

  /**
   * Transcribe audio using Whisper API
   */
  const transcribeAudio = useCallback(async (audioBlob) => {
    if (!audioBlob) return null;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/audio/transcribe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      return data.data?.text || data.text || '';
    } catch (err) {
      console.error('Transcription error:', err);
      setError('Failed to transcribe audio. Please try again.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Record and transcribe in one action
   */
  const recordAndTranscribe = useCallback(async () => {
    await startRecording();
  }, [startRecording]);

  /**
   * Stop recording and get transcription
   */
  const finishRecording = useCallback(async () => {
    const audioBlob = await stopRecording();
    if (audioBlob) {
      const transcription = await transcribeAudio(audioBlob);
      return transcription;
    }
    return null;
  }, [stopRecording, transcribeAudio]);

  /**
   * Cancel recording without transcribing
   */
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    audioChunksRef.current = [];
    setIsRecording(false);
    setAudioLevel(0);
  }, []);

  return {
    isRecording,
    isProcessing,
    error,
    audioLevel,
    startRecording,
    stopRecording,
    transcribeAudio,
    finishRecording,
    cancelRecording,
    recordAndTranscribe,
  };
};

export default useVoiceInput;

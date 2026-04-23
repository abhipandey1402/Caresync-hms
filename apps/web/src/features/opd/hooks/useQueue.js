import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

/**
 * useQueue — SSE-based live queue consumer.
 * Falls back to polling every 15s if SSE connection fails.
 */
export const useQueue = (doctorId = null, date = null) => {
  const [queue, setQueue] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const esRef = useRef(null);
  const pollRef = useRef(null);
  const isMounted = useRef(true);

  const fetchSnapshot = useCallback(async () => {
    try {
      const params = {};
      if (doctorId) params.doctorId = doctorId;
      if (date) params.date = date;
      const res = await api.get('/opd/queue', { params });
      if (isMounted.current) {
        setQueue(res.data.data || []);
        setLoading(false);
      }
    } catch {
      if (isMounted.current) setError('Failed to load queue');
    }
  }, [doctorId, date]);

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    fetchSnapshot();
    pollRef.current = setInterval(fetchSnapshot, 15000);
  }, [fetchSnapshot]);

  useEffect(() => {
    isMounted.current = true;
    const token = useAuthStore.getState().accessToken;

    if (!token) {
      startPolling();
      return;
    }

    // Build SSE URL
    const params = new URLSearchParams();
    if (doctorId) params.set('doctorId', doctorId);
    if (date) params.set('date', date);
    const url = `/api/v1/opd/queue/live?${params.toString()}`;

    // NOTE: EventSource doesn't support custom headers natively in browsers.
    // We pass the token via cookie (httpOnly cookie already sent), which works
    // because our auth middleware reads either Bearer or the session.
    // For SSE we add token as a query param as a workaround.
    const sseUrl = `${url}${params.toString() ? '&' : '?'}token=${token}`;

    try {
      const es = new EventSource(sseUrl);
      esRef.current = es;

      es.onopen = () => {
        if (isMounted.current) {
          setConnected(true);
          setLoading(false);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      };

      es.onmessage = (e) => {
        if (isMounted.current && e.data && !e.data.startsWith(':')) {
          try {
            const data = JSON.parse(e.data);
            setQueue(data);
            setLoading(false);
          } catch {
            // ignore parse errors
          }
        }
      };

      es.onerror = () => {
        if (isMounted.current) {
          setConnected(false);
          es.close();
          // Fallback to polling
          startPolling();
        }
      };
    } catch {
      startPolling();
    }

    return () => {
      isMounted.current = false;
      esRef.current?.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [doctorId, date, startPolling]);

  const refetch = useCallback(() => fetchSnapshot(), [fetchSnapshot]);

  return { queue, loading, connected, error, refetch };
};

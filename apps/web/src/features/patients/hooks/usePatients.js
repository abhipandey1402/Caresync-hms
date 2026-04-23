import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { db } from '@/store/db';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/**
 * Hook for searching patients with offline fallback to Dexie cache.
 */
export const usePatientSearch = (q) => {
  const isOnline = useNetworkStatus();

  return useQuery({
    queryKey: ['patients', 'search', q],
    queryFn: async () => {
      if (!isOnline) {
        // Fallback to local IndexedDB
        if (!q || q.length < 2) {
          return db.patientsCache.orderBy('updatedAt').reverse().limit(10).toArray();
        }
        
        return db.patientsCache
          .filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || (p.phone && p.phone.includes(q)) || (p.uhid && p.uhid.includes(q.toUpperCase())))
          .limit(10).toArray();
      }
      const { data } = await api.get(`/patients?q=${encodeURIComponent(q)}`);
      
      // Update cache in background
      if (data.data?.items) {
        db.patientsCache.bulkPut(data.data.items).catch(console.error);
      }
      
      return data.data.items;
    },
    staleTime: 30_000,
  });
};

/**
 * Hook for fetching a single patient profile.
 */
export const usePatientProfile = (id) => {
  const isOnline = useNetworkStatus();

  return useQuery({
    queryKey: ['patients', id],
    queryFn: async () => {
      if (!isOnline) {
        const patient = await db.patientsCache.get(id);
        if (!patient) throw new Error("Patient not available offline");
        return patient;
      }
      const { data } = await api.get(`/patients/${id}`);
      return data.data;
    },
    staleTime: 60_000,
  });
};

/**
 * Hook for registering a patient, handles offline queueing.
 */
export const useRegisterPatient = () => {
  const isOnline = useNetworkStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientData) => {
      if (!isOnline) {
        // Add to offline queue
        const id = await db.pendingPatients.add({
          ...patientData,
          createdAt: new Date(),
          syncStatus: 'pending'
        });
        return { _id: `local-${id}`, ...patientData, offline: true };
      }
      
      const { data } = await api.post('/patients', patientData);
      
      // Cache the result
      if (data.data) {
        await db.patientsCache.put({ ...data.data, updatedAt: new Date() });
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', 'search'] });
    }
  });
};

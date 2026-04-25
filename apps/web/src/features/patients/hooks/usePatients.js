import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { db } from '@/store/db';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/**
 * Hook for searching patients with offline fallback to Dexie cache.
 */
export const usePatientSearch = (q, page = 1, limit = 10) => {
  const isOnline = useNetworkStatus();
  const skip = (page - 1) * limit;

  return useQuery({
    queryKey: ['patients', 'search', q, page, limit],
    queryFn: async () => {
      if (!isOnline) {
        // Fallback to local IndexedDB
        if (!q || q.length < 2) {
          return {
            items: await db.patientsCache.orderBy('updatedAt').reverse().offset(skip).limit(limit).toArray(),
            total: await db.patientsCache.count()
          };
        }
        
        const filtered = db.patientsCache
          .filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || (p.phone && p.phone.includes(q)) || (p.uhid && p.uhid.includes(q.toUpperCase())));
        
        return {
          items: await filtered.offset(skip).limit(limit).toArray(),
          total: await filtered.count()
        };
      }
      const { data } = await api.get(`/patients`, {
        params: { q, limit, skip }
      });
      
      const result = data.data?.items || data.data || [];
      const total = data.data?.total || (Array.isArray(result) ? result.length : 0);
      
      // Update cache in background
      if (Array.isArray(result)) {
        db.patientsCache.bulkPut(result).catch(console.error);
      }
      
      return { items: result, total };
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

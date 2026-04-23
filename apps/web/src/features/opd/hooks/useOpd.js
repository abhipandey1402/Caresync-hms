import api from '@/services/api';

export const opdApi = {
  createVisit: (body) => api.post('/opd/visits', body),
  
  getQueue: (params = {}) => api.get('/opd/queue', { params }),
  
  updateStatus: (visitId, status) =>
    api.patch(`/opd/visits/${visitId}/status`, { status }),
  
  recordVitals: (visitId, body) =>
    api.put(`/opd/visits/${visitId}/vitals`, body),
  
  getVisit: (visitId) => api.get(`/opd/visits/${visitId}`),
  
  searchDoctors: () =>
    api.get('/admin/staff', { params: { role: 'doctor', limit: 100 } }),
};

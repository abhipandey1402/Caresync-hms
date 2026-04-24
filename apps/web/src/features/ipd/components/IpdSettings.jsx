import React, { useState, useEffect } from 'react';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import api from '@/services/api';
import { Plus, Building, Bed, Trash2 } from 'lucide-react';

export const IpdSettings = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState([]);
  
  // Ward Form
  const [wardData, setWardData] = useState({
    name: '',
    floor: '',
    capacity: 10
  });

  // Bed Form
  const [bedWardId, setBedWardId] = useState('');
  const [beds, setBeds] = useState([{ bedNumber: '', type: 'general', dailyRate: '' }]);

  const fetchWards = async () => {
    try {
      const res = await api.get('/ipd/bed-map'); // Returns wards with beds
      setWards(res.data?.data || []);
    } catch (err) {
      addToast('Failed to load wards', 'error');
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  const handleCreateWard = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/ipd/wards', wardData);
      addToast('Ward created successfully', 'success');
      setWardData({ name: '', floor: '', capacity: 10 });
      fetchWards();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create ward', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addBedRow = () => setBeds([...beds, { bedNumber: '', type: 'general', dailyRate: '' }]);
  const removeBedRow = (index) => {
    if (beds.length > 1) {
      setBeds(beds.filter((_, i) => i !== index));
    }
  };

  const handleAddBeds = async (e) => {
    e.preventDefault();
    if (!bedWardId) return addToast('Please select a ward', 'warning');
    
    setLoading(true);
    try {
      const payload = {
        wardId: bedWardId,
        beds: beds.map(b => ({
          ...b,
          dailyRate: Number(b.dailyRate) * 100 // Convert to paise
        }))
      };
      await api.post('/ipd/beds', payload);
      addToast('Beds added successfully', 'success');
      setBeds([{ bedNumber: '', type: 'general', dailyRate: '' }]);
      fetchWards();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add beds', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Ward Creation */}
      <div className="space-y-6">
        <div className="bg-slate-50 p-6 rounded-2xl border border-brand-border shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-brand-text font-display">
            <Building size={20} className="text-brand-green" /> Create New Ward
          </h3>
          <form onSubmit={handleCreateWard} className="space-y-4">
            <FormField label="Ward Name">
              <input
                required
                value={wardData.name}
                onChange={e => setWardData({ ...wardData, name: e.target.value })}
                placeholder="e.g. ICU, General Ward B"
                className="w-full px-4 py-2 border border-brand-border rounded-xl text-sm"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Floor">
                <input
                  value={wardData.floor}
                  onChange={e => setWardData({ ...wardData, floor: e.target.value })}
                  placeholder="e.g. Ground, 2nd"
                  className="w-full px-4 py-2 border border-brand-border rounded-xl text-sm"
                />
              </FormField>
              <FormField label="Total Capacity">
                <input
                  type="number"
                  required
                  value={wardData.capacity}
                  onChange={e => setWardData({ ...wardData, capacity: e.target.value })}
                  className="w-full px-4 py-2 border border-brand-border rounded-xl text-sm"
                />
              </FormField>
            </div>
            <button
              disabled={loading}
              className="w-full py-2 bg-brand-green text-white font-bold rounded-xl text-sm hover:bg-brand-green-dark transition-colors shadow-sm"
            >
              {loading ? 'Processing...' : 'Create Ward'}
            </button>
          </form>
        </div>

        {/* Ward List Summary */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
          <h3 className="text-sm font-bold mb-4 text-brand-text-sec uppercase tracking-wider">Configured Wards</h3>
          <div className="space-y-2">
            {wards.length === 0 ? (
              <p className="text-xs text-brand-text-sec italic text-center py-4">No wards created yet.</p>
            ) : (
              wards.map(w => (
                <div key={w._id} className="flex items-center justify-between p-3 border border-brand-border rounded-xl hover:bg-slate-50">
                  <div>
                    <div className="font-bold text-sm">{w.name}</div>
                    <div className="text-[10px] text-brand-text-sec">Floor: {w.floor || 'N/A'} | Capacity: {w.capacity}</div>
                  </div>
                  <div className="text-xs font-bold text-brand-green">{w.beds?.length || 0} Beds</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bed Creation */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-brand-text font-display">
            <Bed size={20} className="text-brand-green" /> Add Beds to Ward
          </h3>
          <form onSubmit={handleAddBeds} className="space-y-4">
             <FormField label="Select Ward">
               <select
                 required
                 value={bedWardId}
                 onChange={e => setBedWardId(e.target.value)}
                 className="w-full px-4 py-2 border border-brand-border rounded-xl text-sm bg-white"
               >
                 <option value="">-- Choose Ward --</option>
                 {wards.map(w => (
                   <option key={w._id} value={w._id}>{w.name} ({w.floor || 'N/A'})</option>
                 ))}
               </select>
             </FormField>

             <div className="space-y-3">
               <div className="grid grid-cols-12 gap-2 px-1 text-[10px] font-bold text-brand-text-sec uppercase">
                 <div className="col-span-4">Bed Number</div>
                 <div className="col-span-4">Type</div>
                 <div className="col-span-3">Rate (₹)</div>
                 <div className="col-span-1"></div>
               </div>
               
               {beds.map((bed, i) => (
                 <div key={i} className="grid grid-cols-12 gap-2 items-center">
                   <div className="col-span-4">
                     <input
                       required
                       placeholder="G-01"
                       value={bed.bedNumber}
                       onChange={e => {
                         const nb = [...beds];
                         nb[i].bedNumber = e.target.value;
                         setBeds(nb);
                       }}
                       className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs focus:ring-1 focus:ring-brand-green outline-none"
                     />
                   </div>
                   <div className="col-span-4">
                     <select
                       value={bed.type}
                       onChange={e => {
                          const nb = [...beds];
                          nb[i].type = e.target.value;
                          setBeds(nb);
                       }}
                       className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs bg-white focus:ring-1 focus:ring-brand-green outline-none"
                     >
                       <option value="general">General</option>
                       <option value="semi_private">Semi-Private</option>
                       <option value="private">Private</option>
                       <option value="icu">ICU</option>
                       <option value="emergency">Emergency</option>
                     </select>
                   </div>
                   <div className="col-span-3">
                     <input
                       required
                       type="number"
                       placeholder="1000"
                       value={bed.dailyRate}
                       onChange={e => {
                          const nb = [...beds];
                          nb[i].dailyRate = e.target.value;
                          setBeds(nb);
                       }}
                       className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs focus:ring-1 focus:ring-brand-green outline-none"
                     />
                   </div>
                   <div className="col-span-1">
                     {beds.length > 1 && (
                       <button 
                        type="button" 
                        onClick={() => removeBedRow(i)}
                        className="text-rose-400 hover:text-rose-600 transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                     )}
                   </div>
                 </div>
               ))}
             </div>

             <div className="flex justify-between items-center pt-2">
               <button
                 type="button"
                 onClick={addBedRow}
                 className="text-xs font-bold text-brand-green flex items-center gap-1 hover:underline"
               >
                 <Plus size={14} /> Add Another Bed
               </button>
               
               <div className="text-[10px] text-brand-text-sec italic">
                 {beds.length} beds to be added
               </div>
             </div>

             <button
               disabled={loading || !bedWardId}
               className="w-full py-2 bg-brand-text text-white font-bold rounded-xl text-sm hover:bg-black transition-colors disabled:opacity-50 shadow-sm"
             >
               {loading ? 'Saving Beds...' : 'Add Beds to Ward'}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
};

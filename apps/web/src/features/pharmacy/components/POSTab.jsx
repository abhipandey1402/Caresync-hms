import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { FormField } from '@/components/ui/FormField';

export const POSTab = () => {
  const { addToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([{ medicineId: '', qty: 1, mrp: '' }]);
  const [patientId, setPatientId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [ptsRes, medsRes] = await Promise.all([
          api.get('/patients', { params: { limit: 20 } }),
          api.get('/pharmacy/inventory', { params: { limit: 100 } })
        ]);
        setPatients(ptsRes.data?.data?.items || ptsRes.data?.data || []);
        setMedicines(medsRes.data?.data || []);
      } catch (err) {
        addToast('Failed to load initial data', 'error');
      }
    };
    loadOptions();
  }, [addToast]);

  const updateCart = (index, field, value) => {
    const newCart = [...cart];
    newCart[index][field] = value;
    
    // Auto-fill MRP if medicine selected
    if (field === 'medicineId') {
      const med = medicines.find(m => m._id === value);
      if (med && med.batches?.length) {
        // Use latest batch MRP
        newCart[index].mrp = (med.batches[med.batches.length-1].mrp / 100).toFixed(2);
      }
    }
    
    setCart(newCart);
  };

  const addItem = () => setCart([...cart, { medicineId: '', qty: 1, mrp: '' }]);
  const removeItem = (idx) => setCart(cart.filter((_, i) => i !== idx));

  const total = cart.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.mrp || 0)), 0);

  const handleCheckout = async () => {
    if (!patientId) return addToast('Please select a patient', 'warning');
    if (!cart[0].medicineId) return addToast('Cart is empty', 'warning');

    setSubmitting(true);
    try {
      const payload = {
        patientId,
        items: cart.filter(i => i.medicineId).map(i => ({
          medicineId: i.medicineId,
          qty: Number(i.qty),
          mrp: Number(i.mrp) // Will be converted to paise in service
        })),
        payment: { mode: 'cash', amount: total }
      };

      await api.post('/pharmacy/sales', payload);
      addToast('Sale completed successfully!', 'success');
      setCart([{ medicineId: '', qty: 1, mrp: '' }]);
      setPatientId('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Checkout failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="bg-white border border-brand-border rounded-xl p-4">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ShoppingCart size={20} /> Current Sale</h3>
          
          <div className="mb-6">
            <FormField label="Patient" icon={User}>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-brand-border rounded-xl text-sm"
              >
                <option value="">Select a patient...</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.uhid})</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-3 text-xs font-bold text-brand-text-sec uppercase">
              <div className="col-span-6">Medicine</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-3">Unit Price (₹)</div>
              <div className="col-span-1"></div>
            </div>
            
            {cart.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-6">
                  <select
                    value={item.medicineId}
                    onChange={(e) => updateCart(i, 'medicineId', e.target.value)}
                    className="w-full px-3 py-2 border border-brand-border rounded-lg text-sm"
                  >
                    <option value="">Select...</option>
                    {medicines.map(m => (
                      <option key={m._id} value={m._id} disabled={m.totalQty === 0}>
                        {m.medicineName} {m.totalQty === 0 ? '(Out of stock)' : `(${m.totalQty} left)`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="number" min="1"
                    value={item.qty}
                    onChange={(e) => updateCart(i, 'qty', e.target.value)}
                    className="w-full px-3 py-2 border border-brand-border rounded-lg text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number" step="0.01"
                    value={item.mrp}
                    onChange={(e) => updateCart(i, 'mrp', e.target.value)}
                    className="w-full px-3 py-2 border border-brand-border rounded-lg text-sm"
                  />
                </div>
                <div className="col-span-1 text-right">
                  <button onClick={() => removeItem(i)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button onClick={addItem} className="mt-4 flex items-center gap-2 text-sm font-bold text-brand-green hover:underline">
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-50 border border-brand-border rounded-xl p-5">
          <h3 className="font-bold text-lg mb-4">Summary</h3>
          <div className="space-y-3 mb-6 border-b border-brand-border pb-6">
            <div className="flex justify-between text-sm">
              <span className="text-brand-text-sec">Subtotal</span>
              <span className="font-bold">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-text-sec">Tax (Included)</span>
              <span>—</span>
            </div>
          </div>
          <div className="flex justify-between items-end mb-8">
            <span className="text-sm font-bold text-brand-text-sec uppercase tracking-wider">Total</span>
            <span className="text-3xl font-display font-bold text-brand-green">₹{total.toFixed(2)}</span>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={submitting || !patientId || !cart[0].medicineId}
            className="w-full py-3 bg-brand-green text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
          >
            {submitting ? 'Processing...' : <><CheckCircle2 size={18} /> Complete Sale</>}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { KPICard } from '@/components/ui/KPICard';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import api from '@/services/api';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Calendar,
  Filter,
  RefreshCw,
  Search,
  ArrowRight,
  PieChart as PieChartIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const REPORT_CATEGORIES = [
  { id: 'revenue', name: 'Revenue & Billing', icon: <CreditCard size={20} />, description: 'Collection trends, pending dues, and tax summaries' },
  { id: 'patients', name: 'Patient Insights', icon: <Users size={20} />, description: 'Demographics, visit frequency, and registration trends' },
  { id: 'inventory', name: 'Pharmacy & Stock', icon: <FileText size={20} />, description: 'Stock levels, expiry alerts, and sales history' },
];

const COLORS = ['#1A6B3C', '#2E9B59', '#C8DDD0', '#FFBB28', '#FF8042'];

export const ReportsPage = () => {
  const { tenant } = useAuthStore();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('revenue');
  const [revenueData, setRevenueData] = useState([]);
  const [duesData, setDuesData] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [dateRange, setDateRange] = useState({ 
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revRes, duesRes, jobsRes, patRes, invRes] = await Promise.all([
        api.get('/reports/revenue', { params: dateRange }),
        api.get('/reports/outstanding-dues'),
        api.get('/reports/exports/recent'),
        api.get('/reports/patients', { params: dateRange }),
        api.get('/reports/inventory')
      ]);
      setRevenueData(revRes.data?.data || []);
      setDuesData(duesRes.data?.data || []);
      setRecentJobs(jobsRes.data?.data || []);
      setPatientData(patRes.data?.data || null);
      setInventoryData(invRes.data?.data || null);
    } catch (err) {
      addToast('Failed to load report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Polling for processing jobs
  useEffect(() => {
    const hasProcessing = recentJobs.some(j => j.status === 'processing');
    if (hasProcessing) {
      const interval = setInterval(async () => {
        try {
          const jobsRes = await api.get('/reports/exports/recent');
          setRecentJobs(jobsRes.data?.data || []);
        } catch (err) {
          console.error('Polling failed', err);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [recentJobs]);

  const handleExport = async (type) => {
    try {
      addToast(`Preparing ${type} export...`, 'info');
      const res = await api.post('/reports/export', { 
        type, 
        from: dateRange.from, 
        to: dateRange.to 
      });
      addToast(`Export job started! (ID: ${res.data?.data?.jobId})`, 'success');
      fetchData(); // Refresh jobs list
    } catch (err) {
      addToast('Failed to start export', 'error');
    }
  };

  const totalDues = duesData.reduce((sum, d) => sum + (d.balance || 0), 0);
  
  // Calculate revenue by type
  const revenueByType = revenueData.reduce((acc, bill) => {
    const type = bill.type || 'other';
    acc[type] = (acc[type] || 0) + (bill.amountPaid || 0);
    return acc;
  }, {});

  const pieData = Object.entries(revenueByType).map(([name, value]) => ({
    name: name.toUpperCase(),
    value: value / 100
  }));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'done': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle2 size={10} /> Done</span>;
      case 'processing': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 flex items-center gap-1 animate-pulse"><Clock size={10} /> Processing</span>;
      case 'failed': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 flex items-center gap-1"><AlertCircle size={10} /> Failed</span>;
      default: return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Reports & Analytics" 
        subtitle="Clinic Performance Insight"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-brand-border p-1 rounded-xl shadow-sm">
              <input 
                type="date" 
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="text-xs bg-transparent border-none focus:ring-0 p-1 cursor-pointer font-bold"
              />
              <span className="text-brand-text-sec text-[10px] font-bold uppercase tracking-wider">to</span>
              <input 
                type="date" 
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="text-xs bg-transparent border-none focus:ring-0 p-1 cursor-pointer font-bold"
              />
            </div>
            <button 
              onClick={fetchData}
              className="p-2.5 bg-white border border-brand-border rounded-xl text-[#0F1F17] hover:bg-brand-muted shadow-sm transition-all active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          {/* Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REPORT_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                  activeCategory === cat.id 
                    ? 'bg-brand-green border-brand-green text-white shadow-xl translate-y-[-2px]' 
                    : 'bg-white border-brand-border text-brand-text hover:border-brand-green/30 hover:shadow-md'
                }`}
              >
                {activeCategory === cat.id && (
                  <div className="absolute top-[-20px] right-[-20px] w-16 h-16 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                )}
                <div className="flex items-center gap-4 mb-3">
                  <div className={`p-3 rounded-xl transition-colors ${activeCategory === cat.id ? 'bg-white/20' : 'bg-brand-muted'}`}>
                    {cat.icon}
                  </div>
                  <span className="font-bold text-lg">{cat.name}</span>
                </div>
                <p className={`text-xs leading-relaxed ${activeCategory === cat.id ? 'text-white/80' : 'text-brand-text-sec'}`}>
                  {cat.description}
                </p>
              </button>
            ))}
          </div>

          {activeCategory === 'revenue' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard 
                  title="Total Collection"
                  value={`₹${(revenueData.reduce((s, b) => s + (b.amountPaid || 0), 0) / 100).toLocaleString('en-IN')}`}
                  icon={<TrendingUp size={22} />}
                  loading={loading}
                  highlight
                />
                <KPICard 
                  title="Outstanding Dues"
                  value={`₹${(totalDues / 100).toLocaleString('en-IN')}`}
                  icon={<CreditCard size={22} />}
                  loading={loading}
                  color="gold"
                />
                <KPICard 
                  title="Total Billed"
                  value={`₹${(revenueData.reduce((s, b) => s + (b.total || 0), 0) / 100).toLocaleString('en-IN')}`}
                  icon={<FileText size={22} />}
                  loading={loading}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <DashboardCard title="Revenue Trend" loading={loading}>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData.slice(-10)}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="billNumber" hide />
                          <YAxis tickFormatter={(val) => `₹${val/100}`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(val) => [`₹${(val/100).toLocaleString()}`, 'Revenue']}
                          />
                          <Bar dataKey="amountPaid" fill="#1A6B3C" radius={[6, 6, 0, 0]} barSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </DashboardCard>
                </div>

                <div className="lg:col-span-2">
                  <DashboardCard title="Collection Split" loading={loading}>
                    <div className="h-80 flex flex-col items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </DashboardCard>
                </div>
              </div>

              <DashboardCard title="Exportable Insights" loading={loading} noPadding>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-brand-border">
                  {[
                    { id: 'revenue', name: 'Revenue Summary', color: 'green', desc: 'Daily collections & tax' },
                    { id: 'outstanding-dues', name: 'Outstanding List', color: 'gold', desc: 'Pending patient bills' },
                    { id: 'doctor-collection', name: 'Doctor Collection', color: 'blue', desc: 'Consultation splits' },
                    { id: 'inventory', name: 'Inventory Status', color: 'gray', desc: 'Stock & expiry data' },
                  ].map(report => (
                    <div key={report.id} className="p-6 hover:bg-brand-muted/50 transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2.5 rounded-xl bg-brand-muted group-hover:bg-brand-green/10 group-hover:text-brand-green transition-colors`}>
                          <Download size={20} />
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-[#0F1F17] mb-1">{report.name}</h3>
                      <p className="text-[11px] text-brand-text-sec mb-4">{report.desc}</p>
                      <button 
                        onClick={() => handleExport(report.id)}
                        className="w-full py-2 bg-[#0F1F17] text-white font-bold text-[10px] rounded-lg hover:bg-brand-green transition-all uppercase tracking-widest shadow-sm active:scale-95"
                      >
                        Export CSV
                      </button>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            </div>
          )}

          {activeCategory === 'patients' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <KPICard 
                  title="Total Registered"
                  value={patientData?.totalPatients || 0}
                  icon={<Users size={22} />}
                  loading={loading}
                  highlight
                />
                <KPICard 
                  title="New Registrations"
                  value={patientData?.newPatients || 0}
                  icon={<Calendar size={22} />}
                  loading={loading}
                  color="blue"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardCard title="Gender Distribution" loading={loading}>
                  <div className="h-64 flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={patientData?.visitStats?.map(s => ({ name: s._id || 'UNKNOWN', value: s.count })) || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {patientData?.visitStats?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </DashboardCard>

                <DashboardCard title="Patient Export Options" loading={loading}>
                   <div className="space-y-4">
                     <p className="text-xs text-brand-text-sec italic">Advanced patient analytics coming soon. Use the exports below for current data.</p>
                     <div className="grid grid-cols-1 gap-3">
                       <button 
                        onClick={() => handleExport('patients')}
                        className="flex items-center justify-between p-3 rounded-xl border border-brand-border hover:border-brand-green transition-all group"
                       >
                         <div className="flex items-center gap-3">
                           <Download size={16} className="text-brand-text-sec group-hover:text-brand-green" />
                           <span className="text-sm font-bold">Master Patient List</span>
                         </div>
                         <ArrowRight size={14} className="text-brand-text-sec" />
                       </button>
                     </div>
                   </div>
                </DashboardCard>
              </div>
            </div>
          )}

          {activeCategory === 'inventory' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard 
                  title="Total Items"
                  value={inventoryData?.totalItems || 0}
                  icon={<FileText size={22} />}
                  loading={loading}
                />
                <KPICard 
                  title="Low Stock"
                  value={inventoryData?.lowStock || 0}
                  icon={<AlertCircle size={22} />}
                  loading={loading}
                  color="gold"
                />
                <KPICard 
                  title="Expiring Soon"
                  value={inventoryData?.expiringSoon || 0}
                  icon={<Clock size={22} />}
                  loading={loading}
                  color="red"
                />
              </div>

              <DashboardCard title="Stock Actions" loading={loading}>
                <div className="p-4 border-l-4 border-brand-green bg-brand-muted/30 rounded-r-xl">
                  <p className="text-sm font-bold text-[#0F1F17]">Inventory Management Dashboard</p>
                  <p className="text-xs text-brand-text-sec mt-1">Detailed batch-wise tracking is available in the main Pharmacy module. Use this section for aggregated procurement reports.</p>
                </div>
                <div className="mt-6">
                  <button 
                    onClick={() => handleExport('inventory')}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-green text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    <Download size={18} /> Export Full Inventory Report
                  </button>
                </div>
              </DashboardCard>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-md border border-brand-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-muted/30">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-brand-green" />
                <h3 className="text-sm font-bold text-[#0F1F17]">Export History</h3>
              </div>
              <span className="text-[10px] font-bold text-brand-text-sec uppercase tracking-widest">{recentJobs.length} Jobs</span>
            </div>
            
            <div className="divide-y divide-brand-border max-h-[400px] overflow-y-auto">
              {recentJobs.length > 0 ? recentJobs.map((job, i) => (
                <div key={i} className="p-4 hover:bg-brand-muted/20 transition-all group relative">
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-[#0F1F17] capitalize">{job.reportType?.replace(/-/g, ' ')}</p>
                      <p className="text-[10px] text-brand-text-sec flex items-center gap-1">
                        {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                  
                  {job.status === 'done' && (
                    <a 
                      href={`/api/v1/storage/download?key=${job.pdfKey}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="mt-2 w-full py-1.5 flex items-center justify-center gap-2 bg-brand-green/10 text-brand-green text-[10px] font-bold rounded-lg hover:bg-brand-green hover:text-white transition-all"
                    >
                      <Download size={12} /> Download CSV
                    </a>
                  )}
                  
                  {job.status === 'processing' && (
                    <div className="mt-2 w-full h-1 bg-blue-50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 animate-progress-fast" style={{ width: '60%' }} />
                    </div>
                  )}
                </div>
              )) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-brand-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Download size={20} className="text-brand-text-sec/40" />
                  </div>
                  <p className="text-xs font-medium text-brand-text-sec">No export history yet</p>
                  <p className="text-[10px] text-brand-text-sec/60 mt-1">Your generated reports will appear here</p>
                </div>
              )}
            </div>
          </div>

          <DashboardCard title="Top Outstanding" loading={loading} icon={<AlertCircle size={16} />}>
            <div className="space-y-4">
              {duesData.slice(0, 4).map((due, i) => (
                <div key={i} className="flex justify-between items-center p-2 hover:bg-brand-muted rounded-lg transition-colors">
                  <div>
                    <p className="text-xs font-bold text-[#0F1F17]">{due.patientId?.name || 'Walk-in'}</p>
                    <p className="text-[10px] text-brand-text-sec">{due.billNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-red-600">₹{(due.balance / 100).toLocaleString()}</p>
                    <Link to={`/dashboard/patients/${due.patientId?._id}`} className="text-[9px] font-bold text-brand-green uppercase tracking-tighter hover:underline">Profile →</Link>
                  </div>
                </div>
              ))}
              {duesData.length === 0 && <p className="text-xs text-center text-brand-text-sec">Clean slate!</p>}
              {duesData.length > 4 && (
                <button className="w-full py-2 border border-brand-border rounded-lg text-[10px] font-bold text-brand-text-sec hover:bg-brand-muted">
                  VIEW ALL {duesData.length} DUES
                </button>
              )}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

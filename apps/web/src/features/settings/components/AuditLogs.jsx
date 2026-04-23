import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Pencil, Trash2, LogIn, LogOut, ChevronDown, ChevronUp, AlertCircle, X, ArrowRight } from 'lucide-react';

const ActionBadge = ({ action }) => {
  const configs = {
    create: { bg: 'bg-[#E8F5EE]', text: 'text-[#1A6B3C]', icon: <Plus className="w-3 h-3" /> },
    update: { bg: 'bg-[#EFF6FF]', text: 'text-[#1E40AF]', icon: <Pencil className="w-3 h-3" /> },
    delete: { bg: 'bg-[#FEF2F2]', text: 'text-[#991B1B]', icon: <Trash2 className="w-3 h-3" /> },
    login:  { bg: 'bg-[#F5F0FF]', text: 'text-[#5B21B6]', icon: <LogIn className="w-3 h-3" /> },
    logout: { bg: 'bg-[#FDF4E7]', text: 'text-[#92400E]', icon: <LogOut className="w-3 h-3" /> },
  };
  const conf = configs[action] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: null };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium uppercase ${conf.bg} ${conf.text}`}>
      {conf.icon} {action}
    </span>
  );
};

export const AuditLogs = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Mock data
  const logs = [
    { id: '1', time: '10:42 AM', date: '10 Jan 2024', user: 'Dr. Rajesh Sharma', role: 'Doctor', action: 'create', resource: 'patients', resourceId: '65a3f2b1c4d5e6f7a8b9c0', ip: '192.168.1.105', ua: 'Chrome 120 / Windows' },
    { id: '2', time: '10:38 AM', date: '10 Jan 2024', user: 'Sunita Devi', role: 'Receptionist', action: 'update', resource: 'bills', resourceId: 'b9c065a3f2b1c4d5e6f7a8', ip: '192.168.1.101', ua: 'Firefox 122 / Android' },
    { id: '3', time: '09:15 AM', date: '10 Jan 2024', user: 'Admin User', role: 'Admin', action: 'delete', resource: 'appointments', resourceId: 'd5e6f7a8b9c065a3f2b1c4', ip: '192.168.1.5', ua: 'Safari / iOS' },
    { id: '4', time: '08:00 AM', date: '10 Jan 2024', user: 'Amit Kumar', role: 'Pharmacist', action: 'login', resource: 'auth', resourceId: '-', ip: '192.168.1.200', ua: 'Edge / Windows' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 font-body">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text font-display">Audit Logs</h1>
          <p className="text-sm text-brand-text-sec mt-1">सभी changes का record</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-sec" />
            <input 
              type="text" 
              placeholder="Search action or ID..." 
              className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-lg text-sm focus:ring-2 focus:ring-brand-green outline-none"
            />
          </div>
          <select className="px-4 py-2 border border-brand-border rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-green outline-none">
            <option value="">All Resources</option>
            <option value="patients">Patients</option>
            <option value="bills">Bills</option>
            <option value="pharmacy">Pharmacy</option>
          </select>
          <select className="px-4 py-2 border border-brand-border rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-green outline-none">
            <option value="">All Users</option>
            <option value="doctor">Doctors</option>
            <option value="receptionist">Receptionists</option>
          </select>
          <div className="flex items-center gap-2">
            <input type="date" className="px-3 py-2 border border-brand-border rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-green outline-none" />
            <span className="text-brand-text-sec text-sm">to</span>
            <input type="date" className="px-3 py-2 border border-brand-border rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-green outline-none" />
          </div>
          <button className="p-2 text-brand-text-sec hover:text-brand-text hover:bg-brand-muted rounded-lg transition-colors flex items-center gap-1 text-sm font-medium">
            <X className="w-4 h-4" /> Clear
          </button>
        </div>

        <p className="text-sm text-brand-text-sec mb-4 font-medium">Showing {logs.length} logs for the last 7 days</p>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-brand-border">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-brand-muted text-brand-text font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3 font-mono text-[10px]">ID</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50">
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr 
                    onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                    className={`hover:bg-brand-muted/50 cursor-pointer transition-colors ${expandedRow === log.id ? 'bg-brand-muted/30' : 'bg-white'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-brand-text">{log.time}</div>
                      <div className="text-xs text-brand-text-sec">{log.date}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-brand-text">{log.user}</td>
                    <td className="px-4 py-3"><span className="text-xs border border-brand-border rounded px-2 py-0.5 bg-white text-brand-text-sec">{log.role}</span></td>
                    <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
                    <td className="px-4 py-3 text-brand-text-sec font-medium">{log.resource}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{log.resourceId.substring(0,8)}...</td>
                    <td className="px-4 py-3 text-brand-text-sec text-xs">{log.ip}</td>
                    <td className="px-4 py-3 text-right">
                      {expandedRow === log.id ? <ChevronUp className="w-4 h-4 text-brand-text-sec inline" /> : <ChevronDown className="w-4 h-4 text-brand-text-sec inline" />}
                    </td>
                  </tr>
                  
                  {/* Expanded Detail Drawer */}
                  <AnimatePresence>
                    {expandedRow === log.id && (
                      <tr>
                        <td colSpan="8" className="p-0 border-b border-brand-border">
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-[#FAFAFA] overflow-hidden"
                          >
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative border-l-4 border-brand-green">
                              <div className="space-y-4">
                                <h4 className="text-sm font-bold text-brand-text border-b border-brand-border pb-2 uppercase tracking-wider">Audit Detail</h4>
                                <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                  <span className="text-brand-text-sec font-medium">User:</span><span className="text-brand-text">{log.user}</span>
                                  <span className="text-brand-text-sec font-medium">Role:</span><span className="text-brand-text">{log.role}</span>
                                  <span className="text-brand-text-sec font-medium">Action:</span><span><ActionBadge action={log.action} /></span>
                                  <span className="text-brand-text-sec font-medium">Resource:</span><span className="text-brand-text font-medium">{log.resource}</span>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="text-sm font-bold text-brand-text border-b border-brand-border pb-2 uppercase tracking-wider">Technical Data</h4>
                                <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                  <span className="text-brand-text-sec font-medium">Resource ID:</span><span className="font-mono text-brand-text bg-white border border-brand-border px-1.5 py-0.5 rounded text-xs select-all">{log.resourceId}</span>
                                  <span className="text-brand-text-sec font-medium">IP Address:</span><span className="font-mono text-brand-text">{log.ip}</span>
                                  <span className="text-brand-text-sec font-medium">User Agent:</span><span className="text-brand-text truncate" title={log.ua}>{log.ua}</span>
                                  <span className="text-brand-text-sec font-medium">Timestamp:</span><span className="text-brand-text">{log.date}, {log.time}</span>
                                </div>
                              </div>
                              <div className="md:col-span-2 pt-4 flex justify-end">
                                <button className="bg-white border border-brand-border px-4 py-2 rounded-lg text-sm font-medium text-brand-green hover:bg-brand-muted hover:border-brand-green/30 transition-colors flex items-center gap-2 shadow-sm">
                                  View Resource <ArrowRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center">
          <button className="px-6 py-2 border border-brand-border rounded-lg text-sm font-medium text-brand-text-sec hover:text-brand-text hover:bg-brand-muted transition-colors shadow-sm bg-white">
            Load more logs
          </button>
        </div>
      </div>
    </div>
  );
};

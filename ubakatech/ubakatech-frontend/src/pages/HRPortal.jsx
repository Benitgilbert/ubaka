import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../context/AuthContext';
import {
  Users, CheckSquare, Clock, Monitor, BarChart3, Plus, Check, X,
  Laptop, Smartphone, Package, RefreshCw, AlertTriangle, ChevronDown,
  ChevronUp, Award, DollarSign, CalendarDays, Layers, ShieldCheck,
  TrendingUp, Inbox, Send, Filter, Search, Tag, Trash2, Edit3,
  Wifi, Globe, Code2, Palette, MessageSquare, HardDrive, FileText
} from 'lucide-react';

// ─── API HELPER ──────────────────────────────────────────────────────────────

const useHRApi = () => {
  const { token } = useAuth();

  const api = useCallback(async (path, options = {}) => {
    const res = await fetch(`${API_BASE_URL}/hr${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }, [token]);

  return api;
};

// ─── SMALL REUSABLE COMPONENTS ───────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, color = 'purple' }) => {
  const colors = {
    purple: 'from-purple-500/10 to-purple-900/0 border-purple-500/20 text-purple-400',
    emerald: 'from-emerald-500/10 to-emerald-900/0 border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-500/10 to-blue-900/0 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/10 to-amber-900/0 border-amber-500/20 text-amber-400',
    rose: 'from-rose-500/10 to-rose-900/0 border-rose-500/20 text-rose-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4 flex items-start gap-3`}>
      <div className={`p-2 rounded-lg bg-slate-900/60`}>
        <Icon className={`w-4 h-4 ${colors[color].split(' ')[3]}`} />
      </div>
      <div>
        <div className="text-2xl font-black text-white leading-none">{value}</div>
        <div className="text-xs font-semibold text-slate-400 mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
};

const Badge = ({ type }) => {
  const map = {
    time_off: { label: '🏖 Time Off', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    hardware: { label: '💻 Hardware', cls: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
    expense: { label: '💰 Expense', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    other: { label: '📋 Other', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
    pending: { label: 'Pending', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    approved: { label: 'Approved', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    rejected: { label: 'Rejected', cls: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
    available: { label: 'Available', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    assigned: { label: 'Assigned', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    maintenance: { label: 'Maintenance', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    retired: { label: 'Retired', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
    received: { label: '📩 Received', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    contacted: { label: '💬 Contacted', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    scoped: { label: '📋 Scoped', cls: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
    archived: { label: '📁 Archived', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
    pending_review: { label: '⏳ New Review', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    interviewing: { label: '👥 Interviewing', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    offered: { label: '🎉 Offered', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  };
  const b = map[type] || { label: type, cls: 'bg-slate-700 text-slate-300' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${b.cls}`}>{b.label}</span>;
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const FormField = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors" />
);

const Select = ({ children, ...props }) => (
  <select {...props} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer">
    {children}
  </select>
);

const Textarea = (props) => (
  <textarea {...props} rows={3} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none" />
);

const Btn = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-2.5 text-sm' };
  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-500 text-white active:scale-[0.98]',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.98]',
    danger: 'bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:text-white active:scale-[0.98]',
    ghost: 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 active:scale-[0.98]',
  };
  return <button {...props} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>{children}</button>;
};

const EmptyState = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-500">
    <Icon className="w-10 h-10 mb-3 opacity-30" />
    <p className="text-sm">{text}</p>
  </div>
);

// ─── TAB 1: OVERVIEW ─────────────────────────────────────────────────────────

const OverviewTab = ({ analytics, approvals, hardware }) => {
  if (!analytics) return <div className="flex items-center justify-center h-64 text-slate-500 text-sm">Loading analytics...</div>;

  const { roleBreakdown = {}, approvalStats = {}, hardwareStats = {}, saasStats = {}, headcount = 0, certifications = 0 } = analytics;
  const total = Object.values(roleBreakdown).reduce((s, v) => s + v, 0) || 1;
  const roleColors = ['bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-pink-500', 'bg-cyan-500'];

  return (
    <div className="space-y-6">
      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Headcount" value={headcount} color="purple" />
        <StatCard icon={Inbox} label="Pending Approvals" value={approvalStats.pending || 0} sub="Awaiting review" color="amber" />
        <StatCard icon={Monitor} label="Hardware Assigned" value={`${hardwareStats.assigned || 0}/${hardwareStats.total || 0}`} sub="devices" color="blue" />
        <StatCard icon={Layers} label="SaaS Seat Usage" value={`${saasStats.usedSeats || 0}/${saasStats.totalSeats || 0}`} sub={`$${(saasStats.monthlyCost || 0).toFixed(0)}/mo`} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount by Role */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-400" />Headcount by Role</h3>
          <div className="space-y-2.5">
            {Object.entries(roleBreakdown).map(([role, count], i) => (
              <div key={role}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium truncate max-w-[180px]">{role}</span>
                  <span className="text-slate-500 font-bold">{count}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${roleColors[i % roleColors.length]} rounded-full transition-all`} style={{ width: `${(count / total) * 100}%` }} />
                </div>
              </div>
            ))}
            {Object.keys(roleBreakdown).length === 0 && <p className="text-slate-500 text-xs text-center py-4">No role data yet</p>}
          </div>
        </div>

        {/* Approval Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-emerald-400" />Approval Stats</h3>
          {['pending', 'approved', 'rejected'].map(s => {
            const total = (approvalStats.pending || 0) + (approvalStats.approved || 0) + (approvalStats.rejected || 0) || 1;
            const v = approvalStats[s] || 0;
            const colors = { pending: 'bg-amber-500', approved: 'bg-emerald-500', rejected: 'bg-rose-500' };
            return (
              <div key={s} className="mb-3">
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-300 capitalize">{s}</span><span className="text-slate-500 font-bold">{v}</span></div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${colors[s]} rounded-full transition-all`} style={{ width: `${(v / total) * 100}%` }} />
                </div>
              </div>
            );
          })}
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-lg font-black text-white">{certifications}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Certifications</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-amber-400">{saasStats.wastedSeats || 0}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Wasted Seats</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Approvals */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" />Recent Requests</h3>
        {approvals.slice(0, 5).length > 0 ? (
          <div className="space-y-2">
            {approvals.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                <div className="flex items-center gap-3">
                  <img src={a.employee?.avatar || a.employeeAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${a.employeeId}`} className="w-7 h-7 rounded-lg bg-slate-800" alt="" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{a.title}</div>
                    <div className="text-[10px] text-slate-500">{a.employee?.name || a.employeeName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2"><Badge type={a.type} /><Badge type={a.status} /></div>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={Inbox} text="No requests submitted yet" />}
      </div>
    </div>
  );
};

// ─── TAB 2: ONBOARDING ───────────────────────────────────────────────────────

const OnboardingTab = ({ isHR }) => {
  const api = useHRApi();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [showAddModal, setShowAddModal] = useState(null); // employeeId
  const [newTask, setNewTask] = useState({ task: '', category: 'IT Setup', dueDate: '' });

  const [confirmDelete, setConfirmDelete] = useState(null); // task | null
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setData(await api('/onboarding')); } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const markTask = async (taskId, val) => {
    try { await api(`/onboarding/tasks/${taskId}`, { method: 'PUT', body: { isComplete: val } }); load(); } catch { }
  };

  const deleteTask = (task) => {
    setConfirmDelete(task);
  };

  const executeDeleteTask = async () => {
    if (!confirmDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await api(`/onboarding/tasks/${confirmDelete.id}`, { method: 'DELETE' });
      setConfirmDelete(null);
      load();
    } catch { } finally {
      setIsDeleting(false);
    }
  };

  const submitTask = async () => {
    if (!newTask.task) return;
    try {
      await api(`/onboarding/${showAddModal}/tasks`, { method: 'POST', body: newTask });
      setShowAddModal(null); setNewTask({ task: '', category: 'IT Setup', dueDate: '' }); load();
    } catch { }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 text-sm">Loading onboarding data...</div>;

  return (
    <div className="space-y-4">
      {data.length === 0 && <EmptyState icon={CheckSquare} text="No employees currently onboarding. Assign tasks to new hires to get started." />}
      {data.map(emp => (
        <div key={emp.employeeId} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors" onClick={() => toggle(emp.employeeId)}>
            <div className="flex items-center gap-3">
              <img src={emp.employeeAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${emp.employeeId}`} className="w-9 h-9 rounded-xl bg-slate-800" alt="" />
              <div>
                <div className="text-sm font-bold text-white">{emp.employeeName}</div>
                <div className="text-[10px] text-slate-500">{emp.roleName || 'Team Member'} · {emp.tasks.length} tasks</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs font-black text-white">{emp.progress}%</div>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all" style={{ width: `${emp.progress}%` }} />
                </div>
              </div>
              {expanded[emp.employeeId] ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </div>
          </div>

          {expanded[emp.employeeId] && (
            <div className="border-t border-slate-800 px-4 pb-4 pt-3 space-y-2">
              {emp.tasks.map(task => (
                <div key={task.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${task.isComplete ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-slate-950/40 border-slate-800'}`}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => markTask(task.id, !task.isComplete)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${task.isComplete ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 hover:border-purple-500'}`}>
                      {task.isComplete && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div>
                      <div className={`text-xs font-semibold ${task.isComplete ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.task}</div>
                      <span className="text-[10px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">{task.category}</span>
                    </div>
                  </div>
                  {isHR && <button onClick={() => deleteTask(task)} className="text-slate-600 hover:text-rose-400 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
                </div>
              ))}
              {isHR && (
                <button onClick={() => setShowAddModal(emp.employeeId)} className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:border-purple-500/50 hover:text-purple-400 text-xs font-semibold transition-all cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />Add Task
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {showAddModal && (
        <Modal title="Add Onboarding Task" onClose={() => setShowAddModal(null)}>
          <div className="space-y-4">
            <FormField label="Task Description"><Input value={newTask.task} onChange={e => setNewTask(p => ({ ...p, task: e.target.value }))} placeholder="e.g. Complete Security Training" /></FormField>
            <FormField label="Category">
              <Select value={newTask.category} onChange={e => setNewTask(p => ({ ...p, category: e.target.value }))}>
                {['Legal', 'IT Setup', 'HR Admin', 'Culture', 'Access & Tools', 'Training', 'General'].map(c => <option key={c}>{c}</option>)}
              </Select>
            </FormField>
            <FormField label="Due Date (optional)"><Input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))} /></FormField>
            <div className="flex gap-2 pt-2">
              <Btn variant="ghost" className="flex-1" onClick={() => setShowAddModal(null)}>Cancel</Btn>
              <Btn className="flex-1" onClick={submitTask} disabled={!newTask.task}><Plus className="w-3.5 h-3.5" />Add Task</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Custom Task Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setConfirmDelete(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-5 animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white">Delete Task?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to delete the task <span className="text-slate-200 font-semibold">"{confirmDelete.task}"</span>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteTask}
                disabled={isDeleting}
                className="flex-1 py-2 inline-flex items-center justify-center gap-2 bg-red-550/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-bold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
              >
                {isDeleting ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TAB 3: APPROVALS ────────────────────────────────────────────────────────

const ApprovalsTab = ({ isHR }) => {
  const { user } = useAuth();
  const api = useHRApi();
  const [view, setView] = useState(isHR ? 'all' : 'mine');
  const [filter, setFilter] = useState('all');
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [form, setForm] = useState({ type: 'time_off', title: '', description: '', startDate: '', endDate: '', amount: '' });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (view === 'mine') params.set('mine', 'true');
      if (filter !== 'all') params.set('status', filter);
      setApprovals(await api(`/approvals?${params}`));
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [view, filter]);

  const submitRequest = async () => {
    if (!form.title) return;
    try {
      await api('/approvals', { method: 'POST', body: form });
      setShowSubmit(false); setForm({ type: 'time_off', title: '', description: '', startDate: '', endDate: '', amount: '' }); load();
    } catch { }
  };

  const review = async (id, status) => {
    try {
      await api(`/approvals/${id}`, { method: 'PUT', body: { status, reviewNote } });
      setReviewTarget(null); setReviewNote(''); load();
    } catch { }
  };

  const filters = ['all', 'pending', 'approved', 'rejected'];

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          {isHR && <button onClick={() => setView('all')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${view === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>All Requests</button>}
          <button onClick={() => setView('mine')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${view === 'mine' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>My Requests</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {filters.map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${filter === f ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>{f}</button>)}
          </div>
          <Btn size="sm" onClick={() => setShowSubmit(true)}><Plus className="w-3.5 h-3.5" />New Request</Btn>
        </div>
      </div>

      {loading && <div className="text-center py-10 text-slate-500 text-sm">Loading requests...</div>}
      {!loading && approvals.length === 0 && <EmptyState icon={Inbox} text="No requests found." />}

      <div className="space-y-3">
        {approvals.map(a => {
          const empName = a.employee?.name || a.employeeName || 'Unknown';
          const empAvatar = a.employee?.avatar || a.employeeAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${a.employeeId}`;
          return (
            <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <img src={empAvatar} className="w-9 h-9 rounded-xl bg-slate-800 shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-sm font-bold text-white">{a.title}</span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{empName} · {new Date(a.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-1.5"><Badge type={a.type} /><Badge type={a.status} /></div>
                  </div>
                  {a.description && <p className="text-xs text-slate-400 mt-2">{a.description}</p>}
                  {a.type === 'time_off' && a.startDate && <div className="text-xs text-slate-500 mt-1">📅 {new Date(a.startDate).toLocaleDateString()} → {new Date(a.endDate).toLocaleDateString()}</div>}
                  {a.type === 'expense' && a.amount && <div className="text-xs text-amber-400 font-bold mt-1">💰 ${a.amount.toFixed(2)}</div>}
                  {a.reviewNote && <div className="mt-2 p-2 bg-slate-800/60 rounded-lg text-xs text-slate-400 italic">"{a.reviewNote}" — {a.reviewer?.name || a.reviewerName}</div>}
                  {isHR && a.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => { setReviewTarget({ id: a.id, action: 'approved' }); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"><Check className="w-3 h-3" />Approve</button>
                      <button onClick={() => { setReviewTarget({ id: a.id, action: 'rejected' }); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"><X className="w-3 h-3" />Reject</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Request Modal */}
      {showSubmit && (
        <Modal title="Submit HR Request" onClose={() => setShowSubmit(false)}>
          <div className="space-y-4">
            <FormField label="Request Type">
              <Select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="time_off">🏖 Time Off</option>
                <option value="hardware">💻 Hardware</option>
                <option value="expense">💰 Expense</option>
                <option value="other">📋 Other</option>
              </Select>
            </FormField>
            <FormField label="Title"><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Short summary of your request" /></FormField>
            <FormField label="Details"><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Add more context..." /></FormField>
            {form.type === 'time_off' && (
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Start Date"><Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></FormField>
                <FormField label="End Date"><Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></FormField>
              </div>
            )}
            {(form.type === 'hardware' || form.type === 'expense') && (
              <FormField label="Estimated Cost (USD)"><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" /></FormField>
            )}
            <div className="flex gap-2 pt-2">
              <Btn variant="ghost" className="flex-1" onClick={() => setShowSubmit(false)}>Cancel</Btn>
              <Btn className="flex-1" onClick={submitRequest} disabled={!form.title}><Send className="w-3.5 h-3.5" />Submit</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Review Modal */}
      {reviewTarget && (
        <Modal title={reviewTarget.action === 'approved' ? '✅ Approve Request' : '❌ Reject Request'} onClose={() => setReviewTarget(null)}>
          <div className="space-y-4">
            <FormField label="Review Note (optional)">
              <Textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Add a note for the employee..." />
            </FormField>
            <div className="flex gap-2 pt-2">
              <Btn variant="ghost" className="flex-1" onClick={() => setReviewTarget(null)}>Cancel</Btn>
              <Btn variant={reviewTarget.action === 'approved' ? 'success' : 'danger'} className="flex-1" onClick={() => review(reviewTarget.id, reviewTarget.action)}>
                {reviewTarget.action === 'approved' ? <><Check className="w-3.5 h-3.5" />Approve</> : <><X className="w-3.5 h-3.5" />Reject</>}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── TAB 4: HARDWARE & SAAS ──────────────────────────────────────────────────

const HardwareTab = () => {
  const api = useHRApi();
  const [section, setSection] = useState('hardware');
  const [hardware, setHardware] = useState([]);
  const [saas, setSaas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editSaas, setEditSaas] = useState(null);
  const [hwForm, setHwForm] = useState({ name: '', serialNumber: '', type: 'laptop', brand: '', specs: '', purchasedAt: '', warrantyUntil: '' });
  const [saasForm, setSaasForm] = useState({ tool: '', category: 'DevOps', totalSeats: '', costPerSeat: '', renewalDate: '' });
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [h, s] = await Promise.all([api('/hardware'), api('/saas')]);
      setHardware(h); setSaas(s);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const addHardware = async () => {
    if (!hwForm.name || !hwForm.serialNumber || !hwForm.type) return;
    try { await api('/hardware', { method: 'POST', body: hwForm }); setShowAdd(false); setHwForm({ name: '', serialNumber: '', type: 'laptop', brand: '', specs: '', purchasedAt: '', warrantyUntil: '' }); load(); } catch { }
  };

  const addSaas = async () => {
    if (!saasForm.tool) return;
    try { await api('/saas', { method: 'POST', body: saasForm }); setSaasForm({ tool: '', category: 'DevOps', totalSeats: '', costPerSeat: '', renewalDate: '' }); load(); } catch { }
  };

  const updateSaas = async () => {
    if (!editSaas) return;
    try { await api(`/saas/${editSaas.id}`, { method: 'PUT', body: editSaas }); setEditSaas(null); load(); } catch { }
  };

  const deviceIcons = { laptop: Laptop, phone: Smartphone, tablet: Smartphone, monitor: Monitor, default: Package };

  const filteredHardware = hardware.filter(h => !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.serialNumber.toLowerCase().includes(search.toLowerCase()));

  const saasCategories = { DevOps: Code2, Design: Palette, Communication: MessageSquare, Productivity: Layers, Security: ShieldCheck, Analytics: BarChart3 };

  return (
    <div className="space-y-4">
      {/* Section Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button onClick={() => setSection('hardware')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${section === 'hardware' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}><HardDrive className="w-3.5 h-3.5" />Hardware Fleet</button>
          <button onClick={() => setSection('saas')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${section === 'saas' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}><Globe className="w-3.5 h-3.5" />SaaS Licenses</button>
        </div>
        <Btn size="sm" onClick={() => setShowAdd(true)}><Plus className="w-3.5 h-3.5" />Register {section === 'hardware' ? 'Device' : 'Tool'}</Btn>
      </div>

      {/* Hardware Section */}
      {section === 'hardware' && (
        <>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" /><Input className="pl-9" placeholder="Search by name or serial..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          {loading ? <div className="text-center py-10 text-slate-500 text-sm">Loading fleet...</div> : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="border-b border-slate-800">
                  <tr>{['Device', 'Serial', 'Specs', 'Status', 'Assigned To', 'Warranty'].map(h => <th key={h} className="text-left py-3 px-4 text-slate-500 font-bold uppercase tracking-wide text-[10px]">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredHardware.map(asset => {
                    const Icon = deviceIcons[asset.type] || deviceIcons.default;
                    const isExpiring = asset.warrantyUntil && new Date(asset.warrantyUntil) < new Date(Date.now() + 90 * 86400000);
                    return (
                      <tr key={asset.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 px-4"><div className="flex items-center gap-2.5"><div className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center shrink-0"><Icon className="w-3.5 h-3.5 text-slate-400" /></div><div><div className="font-semibold text-slate-200">{asset.name}</div><div className="text-slate-600 capitalize">{asset.type} · {asset.brand || '—'}</div></div></div></td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{asset.serialNumber}</td>
                        <td className="py-3 px-4 text-slate-400 max-w-[160px] truncate">{asset.specs || '—'}</td>
                        <td className="py-3 px-4"><Badge type={asset.status} /></td>
                        <td className="py-3 px-4">{asset.assignedTo?.name || asset.assignedToName || <span className="text-slate-600">Unassigned</span>}</td>
                        <td className="py-3 px-4">{asset.warrantyUntil ? <span className={isExpiring ? 'text-amber-400 font-semibold flex items-center gap-1' : 'text-slate-400'}>{isExpiring && <AlertTriangle className="w-3 h-3" />}{new Date(asset.warrantyUntil).toLocaleDateString()}</span> : <span className="text-slate-600">—</span>}</td>
                      </tr>
                    );
                  })}
                  {filteredHardware.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-slate-600">No hardware assets registered</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* SaaS Section */}
      {section === 'saas' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {saas.map(tool => {
              const pct = tool.totalSeats > 0 ? Math.round((tool.usedSeats / tool.totalSeats) * 100) : 0;
              const isWasted = pct < 50 && tool.totalSeats > 0;
              const CatIcon = saasCategories[tool.category] || Globe;
              return (
                <div key={tool.id} className={`bg-slate-900 border rounded-2xl p-4 ${isWasted ? 'border-amber-500/20' : 'border-slate-800'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center"><CatIcon className="w-4 h-4 text-purple-400" /></div>
                      <div>
                        <div className="text-sm font-bold text-white">{tool.tool}</div>
                        <div className="text-[10px] text-slate-500">{tool.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isWasted && <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full"><AlertTriangle className="w-2.5 h-2.5" />Low usage</span>}
                      <button onClick={() => setEditSaas({ ...tool })} className="text-slate-600 hover:text-slate-300 cursor-pointer transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="mb-1 flex justify-between text-xs"><span className="text-slate-400">{tool.usedSeats} / {tool.totalSeats} seats</span><span className="font-bold text-white">{pct}%</span></div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div className={`h-full rounded-full transition-all ${pct < 50 ? 'bg-amber-500' : pct < 80 ? 'bg-emerald-500' : 'bg-purple-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    {tool.costPerSeat ? <span>${tool.costPerSeat}/seat/mo · <span className="text-slate-400 font-semibold">${(tool.usedSeats * tool.costPerSeat).toFixed(2)} total</span></span> : <span>Pay-as-you-go</span>}
                    {tool.renewalDate && <span>Renews {new Date(tool.renewalDate).toLocaleDateString()}</span>}
                  </div>
                </div>
              );
            })}
            {saas.length === 0 && <div className="col-span-2"><EmptyState icon={Globe} text="No SaaS tools registered yet" /></div>}
          </div>
        </div>
      )}

      {/* Add Hardware Modal */}
      {showAdd && section === 'hardware' && (
        <Modal title="Register Hardware Asset" onClose={() => setShowAdd(false)}>
          <div className="space-y-3">
            <FormField label="Device Name"><Input value={hwForm.name} onChange={e => setHwForm(p => ({ ...p, name: e.target.value }))} placeholder="MacBook Pro M3 Max" /></FormField>
            <FormField label="Serial Number"><Input value={hwForm.serialNumber} onChange={e => setHwForm(p => ({ ...p, serialNumber: e.target.value }))} placeholder="SN-ABC-001" /></FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Type"><Select value={hwForm.type} onChange={e => setHwForm(p => ({ ...p, type: e.target.value }))}>{['laptop', 'desktop', 'monitor', 'phone', 'tablet', 'accessory'].map(t => <option key={t}>{t}</option>)}</Select></FormField>
              <FormField label="Brand"><Input value={hwForm.brand} onChange={e => setHwForm(p => ({ ...p, brand: e.target.value }))} placeholder="Apple" /></FormField>
            </div>
            <FormField label="Specs"><Input value={hwForm.specs} onChange={e => setHwForm(p => ({ ...p, specs: e.target.value }))} placeholder="16GB RAM, 512GB SSD" /></FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Purchased"><Input type="date" value={hwForm.purchasedAt} onChange={e => setHwForm(p => ({ ...p, purchasedAt: e.target.value }))} /></FormField>
              <FormField label="Warranty Until"><Input type="date" value={hwForm.warrantyUntil} onChange={e => setHwForm(p => ({ ...p, warrantyUntil: e.target.value }))} /></FormField>
            </div>
            <div className="flex gap-2 pt-2">
              <Btn variant="ghost" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Btn>
              <Btn className="flex-1" onClick={addHardware}><Plus className="w-3.5 h-3.5" />Register</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Add SaaS Modal */}
      {showAdd && section === 'saas' && (
        <Modal title="Add SaaS Tool" onClose={() => setShowAdd(false)}>
          <div className="space-y-3">
            <FormField label="Tool Name"><Input value={saasForm.tool} onChange={e => setSaasForm(p => ({ ...p, tool: e.target.value }))} placeholder="GitHub Enterprise" /></FormField>
            <FormField label="Category"><Select value={saasForm.category} onChange={e => setSaasForm(p => ({ ...p, category: e.target.value }))}>{Object.keys(saasCategories).map(c => <option key={c}>{c}</option>)}</Select></FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Total Seats"><Input type="number" value={saasForm.totalSeats} onChange={e => setSaasForm(p => ({ ...p, totalSeats: e.target.value }))} placeholder="10" /></FormField>
              <FormField label="Cost/Seat/Mo ($)"><Input type="number" value={saasForm.costPerSeat} onChange={e => setSaasForm(p => ({ ...p, costPerSeat: e.target.value }))} placeholder="21.00" /></FormField>
            </div>
            <FormField label="Renewal Date"><Input type="date" value={saasForm.renewalDate} onChange={e => setSaasForm(p => ({ ...p, renewalDate: e.target.value }))} /></FormField>
            <div className="flex gap-2 pt-2">
              <Btn variant="ghost" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Btn>
              <Btn className="flex-1" onClick={addSaas}><Plus className="w-3.5 h-3.5" />Add Tool</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit SaaS Modal */}
      {editSaas && (
        <Modal title={`Edit — ${editSaas.tool}`} onClose={() => setEditSaas(null)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Total Seats"><Input type="number" value={editSaas.totalSeats} onChange={e => setEditSaas(p => ({ ...p, totalSeats: e.target.value }))} /></FormField>
              <FormField label="Used Seats"><Input type="number" value={editSaas.usedSeats} onChange={e => setEditSaas(p => ({ ...p, usedSeats: e.target.value }))} /></FormField>
            </div>
            <FormField label="Cost/Seat/Mo ($)"><Input type="number" value={editSaas.costPerSeat || ''} onChange={e => setEditSaas(p => ({ ...p, costPerSeat: e.target.value }))} /></FormField>
            <FormField label="Renewal Date"><Input type="date" value={editSaas.renewalDate ? editSaas.renewalDate.split('T')[0] : ''} onChange={e => setEditSaas(p => ({ ...p, renewalDate: e.target.value }))} /></FormField>
            <FormField label="Notes"><Textarea value={editSaas.notes || ''} onChange={e => setEditSaas(p => ({ ...p, notes: e.target.value }))} /></FormField>
            <div className="flex gap-2 pt-2">
              <Btn variant="ghost" className="flex-1" onClick={() => setEditSaas(null)}>Cancel</Btn>
              <Btn className="flex-1" onClick={updateSaas}><Check className="w-3.5 h-3.5" />Save</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── TAB 5: ANALYTICS ────────────────────────────────────────────────────────

const AnalyticsTab = ({ analytics }) => {
  const api = useHRApi();
  const [certs, setCerts] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [showAddCert, setShowAddCert] = useState(false);
  const [certForm, setCertForm] = useState({ name: '', issuer: '', issuedAt: '', expiresAt: '', cost: '', badgeUrl: '' });

  useEffect(() => {
    (async () => {
      try { setCerts(await api('/certifications')); } catch { } finally { setLoadingCerts(false); }
    })();
  }, []);

  const submitCert = async () => {
    if (!certForm.name) return;
    try { await api('/certifications', { method: 'POST', body: certForm }); setCerts(await api('/certifications')); setShowAddCert(false); setCertForm({ name: '', issuer: '', issuedAt: '', expiresAt: '', cost: '', badgeUrl: '' }); } catch { }
  };

  if (!analytics) return <div className="text-center py-20 text-slate-500 text-sm">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      {/* Analytics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Employees" value={analytics.headcount} color="purple" />
        <StatCard icon={Monitor} label="Devices in Fleet" value={analytics.hardwareStats?.total || 0} sub={`${analytics.hardwareStats?.assigned || 0} assigned`} color="blue" />
        <StatCard icon={DollarSign} label="Monthly SaaS Cost" value={`$${(analytics.saasStats?.monthlyCost || 0).toFixed(0)}`} sub={`${analytics.saasStats?.wastedSeats || 0} wasted seats`} color="amber" />
        <StatCard icon={Award} label="Certifications" value={analytics.certifications || 0} color="emerald" />
      </div>

      {/* Certifications Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Award className="w-4 h-4 text-amber-400" />Certifications & Education</h3>
          <Btn size="sm" onClick={() => setShowAddCert(true)}><Plus className="w-3.5 h-3.5" />Log Cert</Btn>
        </div>
        {loadingCerts ? (
          <div className="text-center py-10 text-slate-500 text-sm">Loading certifications...</div>
        ) : certs.length === 0 ? (
          <EmptyState icon={Award} text="No certifications logged yet" />
        ) : (
          <table className="w-full text-xs">
            <thead className="border-b border-slate-800">
              <tr>{['Employee', 'Certification', 'Issuer', 'Issued', 'Expires', 'Cost'].map(h => <th key={h} className="text-left py-3 px-4 text-slate-500 font-bold uppercase tracking-wide text-[10px]">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {certs.map(cert => {
                const isExpiringSoon = cert.expiresAt && new Date(cert.expiresAt) < new Date(Date.now() + 90 * 86400000);
                const isExpired = cert.expiresAt && new Date(cert.expiresAt) < new Date();
                return (
                  <tr key={cert.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img src={cert.employee?.avatar || cert.employeeAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${cert.employeeId}`} className="w-6 h-6 rounded-lg bg-slate-800" alt="" />
                        <span className="text-slate-300 font-semibold">{cert.employee?.name || cert.employeeName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{cert.name}</td>
                    <td className="py-3 px-4 text-slate-400">{cert.issuer || '—'}</td>
                    <td className="py-3 px-4 text-slate-400">{cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : '—'}</td>
                    <td className="py-3 px-4">
                      {cert.expiresAt ? (
                        <span className={`font-semibold flex items-center gap-1 ${isExpired ? 'text-rose-400' : isExpiringSoon ? 'text-amber-400' : 'text-slate-400'}`}>
                          {(isExpired || isExpiringSoon) && <AlertTriangle className="w-3 h-3" />}
                          {new Date(cert.expiresAt).toLocaleDateString()}
                        </span>
                      ) : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="py-3 px-4 text-amber-400 font-semibold">{cert.cost ? `$${cert.cost}` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Log Cert Modal */}
      {showAddCert && (
        <Modal title="Log Certification" onClose={() => setShowAddCert(false)}>
          <div className="space-y-3">
            <FormField label="Certification Name"><Input value={certForm.name} onChange={e => setCertForm(p => ({ ...p, name: e.target.value }))} placeholder="AWS Solutions Architect" /></FormField>
            <FormField label="Issuing Body"><Input value={certForm.issuer} onChange={e => setCertForm(p => ({ ...p, issuer: e.target.value }))} placeholder="Amazon Web Services" /></FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Issued On"><Input type="date" value={certForm.issuedAt} onChange={e => setCertForm(p => ({ ...p, issuedAt: e.target.value }))} /></FormField>
              <FormField label="Expires On"><Input type="date" value={certForm.expiresAt} onChange={e => setCertForm(p => ({ ...p, expiresAt: e.target.value }))} /></FormField>
            </div>
            <FormField label="Cost (USD)"><Input type="number" value={certForm.cost} onChange={e => setCertForm(p => ({ ...p, cost: e.target.value }))} placeholder="300.00" /></FormField>
            <div className="flex gap-2 pt-2">
              <Btn variant="ghost" className="flex-1" onClick={() => setShowAddCert(false)}>Cancel</Btn>
              <Btn className="flex-1" onClick={submitCert} disabled={!certForm.name}><Award className="w-3.5 h-3.5" />Log Cert</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── TAB 6: CLIENT REQUESTS TRIAGE ──────────────────────────────────────────

const InquiriesTab = () => {
  const api = useHRApi();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const [toast, setToast] = useState(null); // { type, message } | null

  // Auto-dismiss toast notification
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await api('/inquiries');
      setInquiries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api(`/inquiries/${id}`, {
        method: 'PUT',
        body: { status }
      });
      setInquiries(prev => prev.map(item => item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item));
      showToast('success', `Request status updated to "${status}".`);
    } catch (err) {
      showToast('error', err.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Stats calculation
  const total = inquiries.length;
  const received = inquiries.filter(i => i.status === 'received').length;
  const contacted = inquiries.filter(i => i.status === 'contacted').length;
  const scoped = inquiries.filter(i => i.status === 'scoped').length;
  const archived = inquiries.filter(i => i.status === 'archived').length;

  const filteredInquiries = inquiries.filter(i => {
    const matchesSearch = 
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase()) ||
      i.org.toLowerCase().includes(search.toLowerCase()) ||
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      (i.description && i.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesFilter = filter === 'all' || i.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Inbox} label="Total Inquiries" value={total} color="purple" />
        <StatCard icon={Clock} label="Received (New)" value={received} color="blue" />
        <StatCard icon={MessageSquare} label="Contacted" value={contacted} color="amber" />
        <StatCard icon={Code2} label="Scoped" value={scoped} color="emerald" />
        <StatCard icon={X} label="Archived" value={archived} color="rose" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 p-4 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl p-1 shrink-0">
          {['all', 'received', 'contacted', 'scoped', 'archived'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${filter === f ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              {f === 'received' ? 'New' : f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            className="pl-9 bg-slate-950 border-slate-850"
            placeholder="Search requests by name, organization, description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
          Loading inquiries...
        </div>
      ) : filteredInquiries.length === 0 ? (
        <EmptyState icon={MessageSquare} text="No client requests found matching the filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInquiries.map(inq => (
            <div key={inq.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/60 transition-all flex flex-col md:flex-row gap-5">
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{inq.name}</span>
                      <span className="text-xs text-slate-500 font-mono">({inq.org})</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">ID: {inq.id} · Received {new Date(inq.createdAt).toLocaleString()}</div>
                  </div>
                  <Badge type={inq.status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wide">Service Required</span>
                    <span className="font-semibold text-slate-200 capitalize">{inq.serviceType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wide">Est. Budget</span>
                    <span className="font-semibold text-amber-400">{inq.budget}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wide">Timeline</span>
                    <span className="font-semibold text-blue-400">{inq.timeline}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wide">Contact Email</span>
                    <a href={`mailto:${inq.email}`} className="font-semibold text-purple-400 hover:underline truncate block">{inq.email}</a>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wide mb-1">Project Description</span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/20 p-3 border border-slate-850 rounded-xl whitespace-pre-wrap">{inq.description}</p>
                </div>

                {inq.features && inq.features.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wide mb-1.5">Requested Features</span>
                    <div className="flex flex-wrap gap-1.5">
                      {inq.features.map((feat, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[10px] font-semibold rounded-md">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Operations Triage Action Panel */}
              <div className="md:w-52 shrink-0 md:border-l md:border-slate-800/60 md:pl-5 flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wide mb-2">Triage Control</span>
                  <div className="space-y-1.5">
                    {[
                      { status: 'received', label: 'New / Reset', color: 'ghost' },
                      { status: 'contacted', label: 'Contacted Client', color: 'primary' },
                      { status: 'scoped', label: 'Project Scoped', color: 'success' },
                      { status: 'archived', label: 'Archive Request', color: 'danger' }
                    ].map(btn => (
                      <button
                        key={btn.status}
                        disabled={updatingId === inq.id || inq.status === btn.status}
                        onClick={() => updateStatus(inq.id, btn.status)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          inq.status === btn.status
                            ? 'bg-purple-600/10 border-purple-500/30 text-purple-400 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span>{btn.label}</span>
                        {inq.status === btn.status && <Check className="w-3 h-3 text-purple-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[9px] text-slate-600 font-medium">
                  {inq.updatedAt && `Last update: ${new Date(inq.updatedAt).toLocaleDateString()}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-950/80 border-rose-500/30 text-rose-300'
          }`}>
            {toast.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="text-xs font-semibold">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="p-0.5 rounded hover:bg-slate-850 text-slate-400 hover:text-white transition-all ml-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TAB 7: JOB APPLICATIONS TRIAGE ─────────────────────────────────────────

const ApplicationsTab = () => {
  const api = useHRApi();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const [toast, setToast] = useState(null); // { type, message } | null

  // Auto-dismiss toast notification
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api('/applications');
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api(`/applications/${id}`, {
        method: 'PUT',
        body: { status }
      });
      setApplications(prev => prev.map(item => item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item));
      showToast('success', `Applicant stage updated to "${status}".`);
    } catch (err) {
      showToast('error', err.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Stats calculation
  const total = applications.length;
  const pending = applications.filter(a => a.status === 'pending_review').length;
  const interviewing = applications.filter(a => a.status === 'interviewing').length;
  const offered = applications.filter(a => a.status === 'offered').length;
  const rejected = applications.filter(a => a.status === 'rejected').length;

  const filteredApps = applications.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.roleName.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      (a.pitch && a.pitch.toLowerCase().includes(search.toLowerCase()));
    
    const matchesFilter = filter === 'all' || a.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Applications" value={total} color="purple" />
        <StatCard icon={Clock} label="Pending Review" value={pending} color="amber" />
        <StatCard icon={Inbox} label="Interviewing" value={interviewing} color="blue" />
        <StatCard icon={CheckSquare} label="Offered" value={offered} color="emerald" />
        <StatCard icon={X} label="Rejected" value={rejected} color="rose" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 p-4 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl p-1 shrink-0">
          {['all', 'pending_review', 'interviewing', 'offered', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${filter === f ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              {f === 'pending_review' ? 'New' : f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            className="pl-9 bg-slate-950 border-slate-850"
            placeholder="Search applications by name, role, email, pitch..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
          Loading applications...
        </div>
      ) : filteredApps.length === 0 ? (
        <EmptyState icon={Users} text="No applications found matching the filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.map(app => (
            <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/60 transition-all flex flex-col md:flex-row gap-5">
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{app.name}</span>
                      <span className="text-xs text-slate-500 font-mono">({app.email})</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">ID: {app.id} · Applied {new Date(app.createdAt).toLocaleString()}</div>
                  </div>
                  <Badge type={app.status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wide">Applied Position</span>
                    <span className="font-semibold text-slate-200">{app.roleName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wide">Resume Document</span>
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-purple-400 hover:underline flex items-center gap-1.5 mt-0.5 truncate"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View CV / Resume
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wide">Portfolio / GitHub</span>
                    {app.portfolioUrl ? (
                      <a
                        href={app.portfolioUrl.startsWith('http') ? app.portfolioUrl : `https://${app.portfolioUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-400 hover:underline flex items-center gap-1.5 mt-0.5 truncate"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Portfolio Link
                      </a>
                    ) : (
                      <span className="text-slate-500 italic mt-0.5">Not provided</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wide mb-1">Cover Pitch</span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/20 p-3 border border-slate-850 rounded-xl whitespace-pre-wrap font-sans">{app.pitch}</p>
                </div>
              </div>

              {/* Triage controls */}
              <div className="md:w-52 shrink-0 md:border-l md:border-slate-800/60 md:pl-5 flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wide mb-2">Stage Management</span>
                  <div className="space-y-1.5">
                    {[
                      { status: 'pending_review', label: 'In Review', color: 'ghost' },
                      { status: 'interviewing', label: 'Interviewing', color: 'primary' },
                      { status: 'offered', label: 'Extend Offer', color: 'success' },
                      { status: 'rejected', label: 'Reject / Archive', color: 'danger' }
                    ].map(btn => (
                      <button
                        key={btn.status}
                        disabled={updatingId === app.id || app.status === btn.status}
                        onClick={() => updateStatus(app.id, btn.status)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          app.status === btn.status
                            ? 'bg-purple-600/10 border-purple-500/30 text-purple-400 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span>{btn.label}</span>
                        {app.status === btn.status && <Check className="w-3 h-3 text-purple-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[9px] text-slate-600 font-medium">
                  {app.updatedAt && `Last update: ${new Date(app.updatedAt).toLocaleDateString()}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${
            toast.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/30 text-rose-300'
          }`}>
            {toast.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="text-xs font-semibold">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-0.5 rounded hover:bg-slate-850 text-slate-400 hover:text-white transition-all ml-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN HR PORTAL ──────────────────────────────────────────────────────────

const HRPortal = () => {
  const { user } = useAuth();
  const api = useHRApi();
  const permissions = user?.permissions || [];
  const isHR = permissions.includes('manage_hr');

  const [activeTab, setActiveTab] = useState(isHR ? 'overview' : 'approvals');
  const [analytics, setAnalytics] = useState(null);
  const [approvals, setApprovals] = useState([]);

  useEffect(() => {
    if (isHR) {
      api('/analytics').then(setAnalytics).catch(() => {});
      api('/approvals').then(setApprovals).catch(() => {});
    }
  }, [isHR]);

  const tabs = [
    ...(isHR ? [{ id: 'overview', label: 'Overview', icon: BarChart3 }] : []),
    ...(isHR ? [{ id: 'inquiries', label: 'Client Requests', icon: MessageSquare }] : []),
    ...(isHR ? [{ id: 'applications', label: 'Job Applicants', icon: Users }] : []),
    ...(isHR ? [{ id: 'onboarding', label: 'Onboarding', icon: CheckSquare }] : []),
    { id: 'approvals', label: 'Approvals', icon: Inbox },
    ...(isHR ? [{ id: 'hardware', label: 'Hardware & SaaS', icon: Monitor }] : []),
    ...(isHR ? [{ id: 'analytics', label: 'Analytics', icon: TrendingUp }] : []),
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab analytics={analytics} approvals={approvals} hardware={[]} />;
      case 'inquiries': return <InquiriesTab />;
      case 'applications': return <ApplicationsTab />;
      case 'onboarding': return <OnboardingTab isHR={isHR} />;
      case 'approvals': return <ApprovalsTab isHR={isHR} />;
      case 'hardware': return <HardwareTab />;
      case 'analytics': return <AnalyticsTab analytics={analytics} />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-950">
      {/* Page Header */}
      <div className="px-6 pt-6 pb-0 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              HR & People Ops
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHR ? 'Full HR management — onboarding, approvals, hardware fleet, SaaS licenses, and analytics.' : 'Submit and track your HR requests.'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400">Logged in as</div>
            <div className="text-sm font-bold text-white">{user?.name}</div>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wide">{isHR ? '● HR Admin' : '● Employee'}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-5 border-b border-slate-800">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer -mb-px ${isActive ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderTab()}
      </div>
    </div>
  );
};

export default HRPortal;

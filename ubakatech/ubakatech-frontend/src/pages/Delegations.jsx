import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Users, 
  ShieldAlert, 
  Clock, 
  ArrowRight, 
  Trash2, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Lock, 
  Unlock,
  FileText,
  AlertTriangle,
  UserCheck,
  Zap,
  ShoppingBag,
  Loader2,
  Edit,
  Check,
  X
} from 'lucide-react';

const Delegations = () => {
  const { token, user } = useAuth();
  const socket = useSocket();
  
  // States
  const [employees, setEmployees] = useState([]);
  const [delegations, setDelegations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Button Action states (Transforms / feedback)
  const [delegationSubmitting, setDelegationSubmitting] = useState(false);
  const [hireSubmitting, setHireSubmitting] = useState(false);
  const [revokingId, setRevokingId] = useState(null);

  // Hire Form State
  const [activeRightTab, setActiveRightTab] = useState('delegation'); // 'delegation' or 'hire'
  const [hireName, setHireName] = useState('');
  const [hireEmail, setHireEmail] = useState('');
  const [hirePassword, setHirePassword] = useState('');
  const [hireRole, setHireRole] = useState('software_engineer');
  const [hireTitle, setHireTitle] = useState('');
  
  // Form State
  const [selectedEmp, setSelectedEmp] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().split('T')[0];
  });
  const [reason, setReason] = useState('');
  const [delegationType, setDelegationType] = useState('role'); // 'role' or 'custom'
  const [selectedPerms, setSelectedPerms] = useState([]);

  const handleTogglePerm = (code) => {
    setSelectedPerms(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const getPermissionName = (code) => {
    const perm = permissions.find(p => p.code === code);
    return perm ? perm.name : code;
  };

  // Editing Employee Role Form State
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [editingRole, setEditingRole] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const userPermissions = user?.permissions || [];
  const isAdmin = userPermissions.includes('manage_delegations_admin');
  const canManageUsers = userPermissions.includes('manage_users');

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const sys = perm.system || 'Other';
    if (!acc[sys]) acc[sys] = [];
    acc[sys].push(perm);
    return acc;
  }, {});

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch employees list
      const empRes = await fetch(`${API_BASE_URL}/auth/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData);
      } else {
        throw new Error('Failed to load employee directory');
      }

      // 2. Fetch roles and permissions details
      const rolesRes = await fetch(`${API_BASE_URL}/delegations/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (rolesRes.ok) {
        const { roles: rolesData, permissions: permsData } = await rolesRes.json();
        setRoles(rolesData);
        setPermissions(permsData);
      }

      // 3. Fetch active delegations
      const delRes = await fetch(`${API_BASE_URL}/delegations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (delRes.ok) {
        const delData = await delRes.json();
        setDelegations(delData);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server error loading directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Real-time WebSocket sync
  useEffect(() => {
    if (!socket) return;

    const handleDelegationUpdate = (data) => {
      if (data.action === 'create') {
        setDelegations(prev => {
          if (prev.some(d => d.id === data.delegation.id)) return prev;
          return [data.delegation, ...prev];
        });
      } else if (data.action === 'revoke') {
        setDelegations(prev => prev.map(d => d.id === data.id ? { ...d, isActive: false } : d));
      }
    };

    const handleEmployeeUpdate = (data) => {
      if (data.action === 'created') {
        setEmployees(prev => {
          if (prev.some(e => e.id === data.employee.id)) return prev;
          return [...prev, data.employee].sort((a, b) => a.name.localeCompare(b.name));
        });
      } else if (data.action === 'updated') {
        setEmployees(prev => prev.map(e => e.id === data.employee.id ? data.employee : e));
      }
    };

    socket.on('delegation_updated', handleDelegationUpdate);
    socket.on('employee_updated', handleEmployeeUpdate);

    return () => {
      socket.off('delegation_updated', handleDelegationUpdate);
      socket.off('employee_updated', handleEmployeeUpdate);
    };
  }, [socket]);

  const handleEditEmployeeRole = async (empId) => {
    if (!editingRole) {
      setErrorMsg('Please select a valid role.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setEditSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/employees/${empId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role: editingRole,
          title: editingTitle
        })
      });

      const resData = await response.json();

      if (response.ok) {
        setSuccessMsg(resData.message || 'Employee role updated successfully!');
        setEditingEmpId(null);
        setEditingRole('');
        setEditingTitle('');
        fetchData(); // Trigger full refresh to sync
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setErrorMsg(resData.error || 'Failed to update employee role');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to update employee details.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleSubmitDelegation = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedEmp || !selectedRole || !startDate || !endDate) {
      setErrorMsg('Please fill in all delegation parameters.');
      return;
    }

    if (delegationType === 'custom') {
      if (selectedPerms.length === 0) {
        setErrorMsg('Please select at least one permission to delegate.');
        return;
      }
      
      // Enforce HR boundary client-side
      if (!isAdmin) {
        const technicalPerms = permissions.filter(p => p.system === 'Developer').map(p => p.code);
        const hasTechnical = selectedPerms.some(cp => technicalPerms.includes(cp) || cp === 'manage_delegations_admin');
        if (hasTechnical) {
          setErrorMsg('Security Constraint: HR managers are restricted from delegating technical/developer features.');
          return;
        }
      }
    } else {
      // Client-side block for HR delegating technical role
      const targetRoleData = roles.find(r => r.code === selectedRole);
      if (targetRoleData?.isTechnical && !isAdmin) {
        setErrorMsg(`Security Constraint: Only System Administrators can delegate technical roles (like ${targetRoleData.name}).`);
        return;
      }
    }

    setDelegationSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/delegations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId: selectedEmp,
          targetRoleCode: selectedRole,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          reason,
          customPermissions: delegationType === 'custom' ? selectedPerms : []
        })
      });

      const resData = await response.json();

      if (response.ok) {
        setSuccessMsg(resData.message || 'Delegation coverage active!');
        setSelectedEmp('');
        setSelectedRole('');
        setReason('');
        setSelectedPerms([]);
        setDelegationType('role');
        fetchData();
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setErrorMsg(resData.error || 'Failed to authorize coverage');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to dispatch delegation payload.');
    } finally {
      setDelegationSubmitting(false);
    }
  };

  const handleRevoke = async (id) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setRevokingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/delegations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccessMsg('Coverage privilege revoked immediately.');
        fetchData();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        const errData = await response.json();
        setErrorMsg(errData.error || 'Failed to revoke privilege');
      }
    } catch (err) {
      setErrorMsg('Network failure during revocation.');
    } finally {
      setRevokingId(null);
    }
  };

  const handleHireEmployee = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!hireName || !hireEmail || !hirePassword || !hireRole) {
      setErrorMsg('Please fill in all required fields (Name, Email, Password, and Role).');
      return;
    }

    setHireSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: hireName,
          email: hireEmail,
          password: hirePassword,
          role: hireRole,
          title: hireTitle || roles.find(r => r.code === hireRole)?.name || 'Worker'
        })
      });

      const resData = await response.json();

      if (response.ok) {
        setSuccessMsg(`Successfully hired and onboarded ${hireName}!`);
        setHireName('');
        setHireEmail('');
        setHirePassword('');
        setHireTitle('');
        setHireRole('software_engineer');
        fetchData();
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setErrorMsg(resData.error || 'Failed to register worker');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to dispatch registration payload.');
    } finally {
      setHireSubmitting(false);
    }
  };

  // Helper to check if a specific employee has an active delegation
  const getActiveDelegationForEmployee = (empId) => {
    return delegations.find(d => d.employeeId === empId && d.isActive);
  };

  // Resolve dynamic approver for live routing diagram
  const activeApprover = delegations.find(d => 
    d.isActive && 
    (d.targetRoleCode === 'content_controller' || d.customPermissions?.includes('approve_impressa_products'))
  );

  return (
    <div className="relative min-h-screen text-slate-100 p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-16 overflow-x-hidden">
      
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '12s' }} />
      
      {/* Page Header */}
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-purple-400" />
            Roster & Coverage Hub
          </h1>
          <p className="text-slate-400 text-xs mt-1">Manage employee rosters, dynamic roles, and temporary privilege coverage for sick leaves or vacations</p>
        </div>
        
        <div className="flex gap-2">
          {isAdmin ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold text-indigo-400 rounded-xl shadow-inner shadow-indigo-500/5">
              <Lock className="w-3.5 h-3.5 animate-pulse" />
              SysAdmin Mode
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-400 rounded-xl shadow-inner shadow-amber-500/5">
              <Unlock className="w-3.5 h-3.5" />
              HR Operations Mode
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2 shrink-0 animate-fade-in shadow-lg shadow-emerald-500/5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2 shrink-0 animate-fade-in shadow-lg shadow-red-500/5">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Staff Directory */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Ubaka Tech Staff Roster
            </h3>
            
            <div className="bg-slate-900/15 backdrop-blur-md border border-slate-900 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="space-y-3">
                {employees.map((emp) => {
                  const activeDel = getActiveDelegationForEmployee(emp.id);
                  const isEditing = editingEmpId === emp.id;

                  return (
                    <div 
                      key={emp.id} 
                      className={`relative bg-slate-950/40 backdrop-blur-sm border ${
                        isEditing 
                          ? 'border-purple-500/40 bg-slate-900/60 shadow-lg shadow-purple-500/5' 
                          : 'border-slate-900/80 hover:border-slate-850 hover:bg-slate-900/20'
                      } rounded-xl p-4 transition-all duration-300`}
                    >
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full border border-slate-800 bg-slate-950" />
                            <div>
                              <h4 className="text-xs font-bold text-slate-200">{emp.name}</h4>
                              <p className="text-[10px] text-slate-500">{emp.email}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div className="space-y-1">
                              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider">Job Title</label>
                              <input 
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/60 focus:bg-slate-950 transition-all duration-200"
                                placeholder="e.g. Senior Frontend Dev"
                                disabled={editSubmitting}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider">Company Role</label>
                              <select 
                                value={editingRole}
                                onChange={(e) => setEditingRole(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/60 focus:bg-slate-950 transition-all duration-200"
                                disabled={editSubmitting}
                              >
                                {roles.map(r => (
                                  <option key={r.code} value={r.code} className="bg-slate-950 text-slate-200">{r.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2 border-t border-slate-900/50">
                            <button
                              type="button"
                              onClick={() => setEditingEmpId(null)}
                              disabled={editSubmitting}
                              className="px-3 py-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-250 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditEmployeeRole(emp.id)}
                              disabled={editSubmitting}
                              className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                              {editSubmitting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              Save Role
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full border border-slate-800 bg-slate-950" />
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-200">{emp.name}</h4>
                                <span className="text-[9px] bg-slate-900 border border-slate-850 text-slate-400 px-1.5 py-0.5 rounded font-bold tracking-wide">{emp.title}</span>
                              </div>
                              <p className="text-[10px] text-slate-500">{emp.email}</p>
                              
                              {/* Active Coverage Tag */}
                              {activeDel && (
                                <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-[9px] font-bold text-purple-400 rounded-md animate-pulse">
                                  <Zap className="w-2.5 h-2.5 fill-purple-400/20 text-purple-400" />
                                  Covering: {activeDel.targetRoleName}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Primary Role Badge & Action */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="inline-block px-2.5 py-1 bg-slate-900 border border-slate-850 text-[10px] font-bold text-slate-400 rounded-lg">
                              {emp.roleName}
                            </span>
                            {canManageUsers && (
                              <button
                                onClick={() => {
                                  setEditingEmpId(emp.id);
                                  setEditingRole(emp.role);
                                  setEditingTitle(emp.title || '');
                                }}
                                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                                title="Edit employee role and title"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Delegation Creator & Timelines */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Form Container (Delegation or Hire) */}
            <div className="bg-slate-900/15 backdrop-blur-md border border-slate-900 rounded-2xl p-5 shadow-2xl space-y-4">
              {canManageUsers ? (
                <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-900 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveRightTab('delegation')}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                      activeRightTab === 'delegation'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Assign Coverage
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRightTab('hire')}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                      activeRightTab === 'hire'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Hire Employee
                  </button>
                </div>
              ) : (
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <UserCheck className="w-4.5 h-4.5 text-purple-400" />
                  Assign Temporary Coverage
                </h3>
              )}
              
              {activeRightTab === 'delegation' || !canManageUsers ? (
                <form onSubmit={handleSubmitDelegation} className="space-y-4">
                  {/* Employee select */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Cover Worker</label>
                    <select 
                      value={selectedEmp}
                      onChange={(e) => setSelectedEmp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/60 focus:bg-slate-950 transition-colors"
                      disabled={delegationSubmitting}
                    >
                      <option value="" className="bg-slate-950 text-slate-400">-- Choose employee --</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id} className="bg-slate-950 text-slate-200">{e.name} ({e.roleName})</option>
                      ))}
                    </select>
                  </div>

                  {/* Delegation Type Toggle */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delegation Type</label>
                    <div className="flex bg-slate-950/80 p-1 rounded-lg border border-slate-900 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setDelegationType('role');
                          setSelectedRole('');
                        }}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                          delegationType === 'role'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                        }`}
                      >
                        By Role
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDelegationType('custom');
                          setSelectedRole('custom_permissions');
                        }}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                          delegationType === 'custom'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                        }`}
                      >
                        By Custom Features
                      </button>
                    </div>
                  </div>

                  {delegationType === 'role' ? (
                    /* Target Role select */
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delegate Role & Dashboards</label>
                      <select 
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/60 focus:bg-slate-950 transition-colors"
                        disabled={delegationSubmitting}
                      >
                        <option value="" className="bg-slate-950 text-slate-400">-- Choose target role --</option>
                        {roles.filter(r => r.code !== 'custom_permissions').map(r => (
                          <option 
                            key={r.code} 
                            value={r.code}
                            disabled={r.isTechnical && !isAdmin}
                            className="bg-slate-950"
                          >
                            {r.name} {r.isTechnical ? '🔒 (Admin Only)' : '👥 (HR Delegatable)'}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    /* Custom Permissions Checkbox Table */
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Features to Delegate</label>
                      <div className="max-h-72 overflow-y-auto space-y-4 bg-slate-950/80 p-3 rounded-xl border border-slate-900 scrollbar-thin">
                        {Object.entries(groupedPermissions).map(([systemName, perms]) => {
                          let sysBadgeColor = 'text-purple-400 bg-purple-400/5 border-purple-500/20';
                          let sysIcon = <Zap className="w-3 h-3 text-purple-400" />;
                          if (systemName === 'Impressa') {
                            sysBadgeColor = 'text-amber-400 bg-amber-400/5 border-amber-500/20';
                            sysIcon = <ShoppingBag className="w-3 h-3 text-amber-400" />;
                          } else if (systemName === 'Developer') {
                            sysBadgeColor = 'text-rose-400 bg-rose-400/5 border-rose-500/20';
                            sysIcon = <Lock className="w-3 h-3 text-rose-400" />;
                          }

                          return (
                            <div key={systemName} className="space-y-2">
                              <div className="flex items-center gap-1.5 pb-1 border-b border-slate-900">
                                {sysIcon}
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-wide">{systemName} Features</span>
                              </div>
                              <div className="space-y-1.5">
                                {perms.map(p => {
                                  const isTech = p.system === 'Developer' || p.code === 'manage_delegations_admin';
                                  const isDisabled = isTech && !isAdmin;
                                  const isSelected = selectedPerms.includes(p.code);
                                  
                                  return (
                                    <label 
                                      key={p.code} 
                                      className={`flex items-start gap-2.5 p-2 rounded-lg border text-left transition-all duration-200 ${
                                        isDisabled 
                                          ? 'bg-slate-950/40 border-slate-900/60 opacity-30 cursor-not-allowed'
                                          : isSelected 
                                            ? 'bg-purple-950/20 border-purple-500/40 text-purple-200' 
                                            : 'bg-slate-900/20 border-slate-850/60 text-slate-400 hover:border-slate-800 cursor-pointer'
                                      }`}
                                    >
                                      <input 
                                        type="checkbox"
                                        checked={isSelected}
                                        disabled={isDisabled}
                                        onChange={() => handleTogglePerm(p.code)}
                                        className="mt-0.5 rounded border-slate-850 text-purple-650 focus:ring-purple-500/50 focus:ring-offset-slate-950 bg-slate-950 w-3.5 h-3.5 cursor-pointer disabled:cursor-not-allowed"
                                      />
                                      <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[10px] font-bold tracking-tight">{p.name}</span>
                                          {isTech && (
                                            <span className="text-[7px] font-black bg-rose-500/10 border border-rose-500/20 text-rose-450 px-1 rounded uppercase tracking-wide">
                                              Admin Only
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[9px] text-slate-500 leading-normal">{p.description}</p>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                      <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-purple-500/60 focus:bg-slate-950 transition-colors"
                        disabled={delegationSubmitting}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</label>
                      <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-purple-500/60 focus:bg-slate-950 transition-colors"
                        disabled={delegationSubmitting}
                      />
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coverage Reason</label>
                    <input 
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Gaju sick leave, moderating storefront queue"
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-650 outline-none focus:border-purple-500/60 focus:bg-slate-950 transition-colors"
                      disabled={delegationSubmitting}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={delegationSubmitting}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-500/20 text-xs font-bold text-white rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer mt-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] hover:shadow-purple-500/10"
                  >
                    {delegationSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deploying Authorization...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Deploy Coverage Authorization
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleHireEmployee} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text"
                        value={hireName}
                        onChange={(e) => setHireName(e.target.value)}
                        placeholder="Benit Gilbert"
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-650 outline-none focus:border-purple-500/60 focus:bg-slate-950 transition-colors"
                        disabled={hireSubmitting}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Title</label>
                      <input 
                        type="text"
                        value={hireTitle}
                        onChange={(e) => setHireTitle(e.target.value)}
                        placeholder="Content Moderator"
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-655 outline-none focus:border-purple-500/60 focus:bg-slate-950 transition-colors"
                        disabled={hireSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email"
                      value={hireEmail}
                      onChange={(e) => setHireEmail(e.target.value)}
                      placeholder="moderator@ubakatech.com"
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-655 outline-none focus:border-purple-500/60 focus:bg-slate-950 transition-colors"
                      disabled={hireSubmitting}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                    <input 
                      type="password"
                      value={hirePassword}
                      onChange={(e) => setHirePassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-655 outline-none focus:border-purple-500/60 focus:bg-slate-950 transition-colors"
                      disabled={hireSubmitting}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Role</label>
                    <select 
                      value={hireRole}
                      onChange={(e) => setHireRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/60 focus:bg-slate-950 transition-colors"
                      disabled={hireSubmitting}
                    >
                      {roles.map(r => (
                        <option key={r.code} value={r.code} className="bg-slate-950">
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={hireSubmitting}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-500/20 text-xs font-bold text-white rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer mt-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] hover:shadow-purple-500/10"
                  >
                    {hireSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Onboarding Employee...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Hire & Onboard Employee
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Active Delegations Log */}
            <div className="flex-1 flex flex-col space-y-3 pt-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Active & Scheduled Coverages
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
                {delegations.filter(d => d.isActive).length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                    <span className="text-[10px] text-slate-500">No active coverage delegations found.</span>
                  </div>
                ) : (
                  delegations.filter(d => d.isActive).map((del) => {
                    const expiryDate = new Date(del.endDate);
                    const formattedEnd = expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return (
                      <div 
                        key={del.id} 
                        className="bg-slate-950/45 border border-slate-900 hover:border-slate-850 rounded-2xl p-4 space-y-3 transition-all duration-300 hover:bg-slate-950/60"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="text-[11px] font-extrabold text-slate-200">
                              {del.employeeName}
                            </h4>
                            {del.targetRoleCode === 'custom_permissions' ? (
                              <div className="mt-1.5 space-y-1.5">
                                <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-wide block">
                                  Granted: Custom Features ({del.customPermissions?.length || 0})
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {del.customPermissions?.map(cp => (
                                    <span key={cp} className="inline-block px-2 py-0.5 bg-slate-900 border border-slate-850 text-[8px] text-slate-400 rounded-md font-bold tracking-tight" title={cp}>
                                      {getPermissionName(cp)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-[9px] text-purple-400 font-extrabold uppercase tracking-wide mt-0.5">
                                Granted: {del.targetRoleName}
                              </p>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleRevoke(del.id)}
                            disabled={revokingId === del.id}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.05] active:scale-[0.95]"
                            title="Revoke coverage privilege"
                          >
                            {revokingId === del.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <p className="text-[10px] text-slate-500 italic bg-slate-900/10 p-2.5 rounded-xl border border-slate-900/60">
                          "{del.reason}"
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest gap-2 pt-2 border-t border-slate-900">
                          <div className="flex flex-wrap gap-2">
                            <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> Ends: {formattedEnd}</span>
                            {del.createdAt && (
                              <span className="text-purple-500/90 font-bold">Authorized: {new Date(del.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                          </div>
                          <span>By: {del.authorizerName}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Task Routing Diagram Widget */}
            <div className="bg-slate-950/45 border border-slate-900 rounded-2xl p-4.5 shrink-0 space-y-3 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
                Live Impressa Approval Routing
              </h4>
              
              <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-900 text-[10px]">
                <div className="flex flex-col space-y-0.5">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[8px]">Catalog Queue</span>
                  <span className="text-white font-extrabold tracking-tight">12 Pending items</span>
                </div>
                
                <div className="flex items-center gap-1 px-2.5">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
                  <ArrowRight className="w-4 h-4 text-purple-500" />
                </div>

                <div className="flex flex-col items-center space-y-0.5">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[8px] mb-0.5">Assigned Approver</span>
                  {activeApprover ? (
                    <span className="text-emerald-400 font-bold bg-emerald-400/5 px-2 py-0.5 border border-emerald-400/20 rounded shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      {activeApprover.employeeName.split(' ')[0]} (Cover)
                    </span>
                  ) : (
                    <span className="text-purple-400 font-bold bg-purple-400/5 px-2 py-0.5 border border-purple-400/20 rounded">
                      Gaju (E-commerce Admin)
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Delegations;

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Plus, 
  Trash2, 
  User, 
  AlertCircle, 
  Calendar,
  Grid,
  CheckSquare,
  AlertTriangle,
  Loader2,
  LayoutGrid,
  UserCircle2,
  Clock,
  Flame
} from 'lucide-react';

const Kanban = () => {
  const { token, user } = useAuth();
  const socket = useSocket();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'my-tasks'
  
  // New Task Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newProjId, setNewProjId] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Delete Confirmation Modal State
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, title } | null
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = [
    { id: 'todo', label: 'To Do', color: 'border-t-slate-700 bg-slate-900/40' },
    { id: 'in_progress', label: 'In Progress', color: 'border-t-blue-500 bg-blue-950/5' },
    { id: 'review', label: 'In Review', color: 'border-t-purple-500 bg-purple-950/5' },
    { id: 'done', label: 'Completed', color: 'border-t-emerald-500 bg-emerald-950/5' }
  ];

  const fetchTasks = async () => {
    try {
      const url = selectedProjectId 
        ? `${API_BASE_URL}/tasks?projectId=${selectedProjectId}`
        : `${API_BASE_URL}/tasks`;
        
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (err) {
      // Failed to fetch tasks - silent
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [projRes, empRes] = await Promise.all([
          fetch(`${API_BASE_URL}/projects`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/auth/employees`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (projRes.ok) {
          const projData = await projRes.json();
          setProjects(projData);
          if (projData.length > 0) setNewProjId(projData[0].id);
        }
        if (empRes.ok) {
          const empData = await empRes.json();
          setEmployees(Array.isArray(empData) ? empData : (empData.employees || []));
        }
      } catch (err) {
        // Failed to load initial data - silent
      }

      await fetchTasks();
      setLoading(false);
    };

    fetchInitialData();
  }, [token, selectedProjectId]);

  // WebSocket Live Synchronization
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_channel', 'tasks_global');

    const handleTaskUpdated = (data) => {
      const { action, task, taskId } = data;
      if (action === 'created') {
        setTasks(prev => {
          if (prev.some(t => t.id === task.id)) return prev;
          return [...prev, task];
        });
      } else if (action === 'updated') {
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...task } : t));
      } else if (action === 'deleted') {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      } else {
        // Fallback: full re-sync for legacy drag-drop events
        fetchTasks();
      }
    };

    socket.on('task_updated', handleTaskUpdated);

    return () => {
      socket.off('task_updated', handleTaskUpdated);
    };
  }, [socket, selectedProjectId]);

  // Drag and Drop implementation
  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = async (e, columnId) => {
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove || taskToMove.status === columnId) return;

    const originalTasks = [...tasks];
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: columnId } : t));

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: columnId })
      });

      if (!response.ok) {
        setTasks(originalTasks);
      }
      // Backend will emit task_updated via Socket.io for other clients
    } catch (err) {
      setTasks(originalTasks);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle || isCreating) return;
    setIsCreating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          priority: newPriority,
          projectId: newProjId,
          assigneeId: newAssigneeId || undefined
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        // Backend emits task_updated via Socket.io — all clients auto-update
      }
    } catch (err) {
      // Failed to create task - silent
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteTask = (task) => {
    setConfirmDelete({ id: task.id, title: task.title });
  };

  const handleDeleteTask = async () => {
    if (!confirmDelete || isDeleting) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${confirmDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setConfirmDelete(null);
        // Backend emits task_updated { action: 'deleted' } — all clients auto-update
      }
    } catch (err) {
      // Failed to delete task - silent
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/15 text-red-400 border border-red-500/25';
      case 'high':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/25';
      case 'medium':
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/25';
      case 'low':
        return 'bg-slate-800 text-slate-400 border border-slate-700';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  // Derive visible tasks based on view mode
  const visibleTasks = viewMode === 'my-tasks'
    ? tasks.filter(t => t.assigneeId === user?.id || t.assignee?.id === user?.id)
    : tasks;

  // My Tasks personal stats
  const myStats = {
    total: visibleTasks.length,
    todo: visibleTasks.filter(t => t.status === 'todo').length,
    inProgress: visibleTasks.filter(t => t.status === 'in_progress').length,
    critical: visibleTasks.filter(t => t.priority === 'critical' || t.priority === 'high').length,
    done: visibleTasks.filter(t => t.status === 'done').length,
  };

  return (
    <div className="space-y-6 p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col justify-between overflow-hidden">
      
      {/* Kanban Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-purple-400" />
            {viewMode === 'my-tasks' ? 'My Tasks' : 'Product Backlog & Kanban'}
          </h1>
          <p className="text-slate-400 text-xs">
            {viewMode === 'my-tasks'
              ? `Tasks assigned to you across all projects — ${myStats.total} total`
              : 'Drag and drop cards to update progress in real-time'
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Board
            </button>
            <button
              onClick={() => setViewMode('my-tasks')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'my-tasks'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCircle2 className="w-3.5 h-3.5" />
              My Tasks
            </button>
          </div>

          {/* Project Filtering Dropdown (only in board mode) */}
          {viewMode === 'board' && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}

          {/* Add Task Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-1.5 px-4 rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-purple-500/10 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* My Tasks — Personal Stats Bar */}
      {viewMode === 'my-tasks' && (
        <div className="shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'To Do', value: myStats.todo, icon: Clock, color: 'text-slate-400 bg-slate-800/60 border-slate-700/50' },
            { label: 'In Progress', value: myStats.inProgress, icon: Loader2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { label: 'High Priority', value: myStats.critical, icon: Flame, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
            { label: 'Completed', value: myStats.done, icon: CheckSquare, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${color}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <div>
                <div className="text-lg font-black text-white leading-none">{value}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Columns Grid */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : visibleTasks.length === 0 && viewMode === 'my-tasks' ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <UserCircle2 className="w-8 h-8 text-slate-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">No tasks assigned to you yet</h3>
            <p className="text-xs text-slate-500">Ask your team lead to assign tasks, or switch to Board view to see all tasks.</p>
          </div>
          <button
            onClick={() => setViewMode('board')}
            className="mt-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            View Full Board
          </button>
        </div>
      ) : (
        <div className="flex-1 grid md:grid-cols-4 gap-4 overflow-hidden py-2 min-h-0">
          {columns.map((col) => {
            const colTasks = visibleTasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, col.id)}
                className={`rounded-xl border border-slate-800/80 p-4 flex flex-col min-h-0 overflow-hidden border-t-2 ${col.color}`}
              >
                {/* Column Title */}
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">{col.label}</h3>
                  <span className="text-[10px] bg-slate-950 px-2 py-0.5 border border-slate-800/60 rounded-full text-slate-400 font-bold">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Body: Task list */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {colTasks.length === 0 ? (
                    <div className="h-28 border border-dashed border-slate-850 rounded-lg flex items-center justify-center text-slate-600 text-xs select-none">
                      Drag tasks here
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, task.id)}
                        className="bg-slate-950 border border-slate-850/80 rounded-xl p-4 space-y-3 cursor-grab active:cursor-grabbing hover:border-slate-700/80 transition-colors shadow-sm select-none group"
                      >
                        {/* Title & Delete */}
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-slate-100 group-hover:text-white leading-snug transition-colors">
                            {task.title}
                          </h4>
                          <button
                            onClick={() => confirmDeleteTask(task)}
                            className="text-slate-600 hover:text-red-400 p-0.5 rounded transition-all opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-red-500/10 active:scale-90"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Badges & Assignee */}
                        <div className="flex justify-between items-center gap-2 pt-1 border-t border-slate-900 shrink-0">
                          <div className="flex gap-1.5">
                            {/* Project tag */}
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-slate-900 border border-slate-850 text-slate-500">
                              {projects.find(p => p.id === task.projectId)?.name || 'Project'}
                            </span>
                            {/* Priority tag */}
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${getPriorityStyle(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>

                          {/* Assignee Avatar */}
                          {task.assignee ? (
                            <img
                              src={task.assignee.avatar}
                              alt={task.assignee.name}
                              title={`Assigned to: ${task.assignee.name}`}
                              className="w-5 h-5 rounded-full bg-slate-900 border border-slate-850"
                            />
                          ) : (
                            <div 
                              title="Unassigned"
                              className="w-5 h-5 rounded-full bg-slate-900 border border-dashed border-slate-800 flex items-center justify-center"
                            >
                              <User className="w-2.5 h-2.5 text-slate-600" />
                            </div>
                          )}
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──── Custom Delete Confirmation Modal ──── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl shadow-red-950/20 space-y-5">
            {/* Icon + Title */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white">Delete Task?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You are about to permanently delete{' '}
                  <span className="text-slate-200 font-semibold">"{confirmDelete.title}"</span>.
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                disabled={isDeleting}
                className="flex-1 py-2.5 inline-flex items-center justify-center gap-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-bold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                {isDeleting ? 'Deleting...' : 'Delete Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──── Creation Modal ──── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Create Development Task</h3>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Task Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Bugfix stripe currency parsing"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Enter deep-dive details..."
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-purple-500 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Project</label>
                  <select
                    value={newProjId}
                    onChange={(e) => setNewProjId(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    required
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Assignee</label>
                <select
                  value={newAssigneeId}
                  onChange={(e) => setNewAssigneeId(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="">Unassigned</option>
                  {employees.length > 0
                    ? employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}{emp.title ? ` — ${emp.title}` : ''}
                        </option>
                      ))
                    : (
                        <>
                          <option value="mock-dev-id">Benit Gilbert (Developer)</option>
                          <option value="mock-marketer-id">Growth Marketer (Marketing)</option>
                          <option value="mock-admin-id">Inzozi Admin (Admin)</option>
                        </>
                      )
                  }
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating}
                  className="flex-1 py-2 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-slate-400 font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newTitle}
                  className="flex-1 py-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-lg text-xs transition-all shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
                >
                  {isCreating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  {isCreating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Kanban;

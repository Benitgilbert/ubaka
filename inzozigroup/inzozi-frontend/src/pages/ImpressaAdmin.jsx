import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  ShoppingBag, 
  Check, 
  X, 
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Activity,
  FileText,
  Loader2,
  Clock,
  Send,
  Sparkles,
  User
} from 'lucide-react';

const ImpressaAdmin = () => {
  const { token, user } = useAuth();
  const socket = useSocket();
  
  const [approvals, setApprovals] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // Loading/submitting states for actions
  const [processingProduct, setProcessingProduct] = useState(null); // { id, action: 'approved' | 'rejected' }
  const [processingTicket, setProcessingTicket] = useState(null); // { id, action: 'resolved' | 'in_progress' }
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const userPermissions = user?.permissions || [];
  const canApproveProducts = userPermissions.includes('approve_products');
  const canManageTickets = userPermissions.includes('manage_tickets');

  const fetchImpressaData = async () => {
    setLoading(true);
    try {
      if (canApproveProducts) {
        const appRes = await fetch(`${API_BASE_URL}/projects/impressa/approvals`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (appRes.ok) {
          const appData = await appRes.json();
          setApprovals(appData);
        } else {
          const err = await appRes.json();
          setMsg({ type: 'error', text: err.error || 'Failed to fetch pending catalog approvals.' });
        }
      }

      if (canManageTickets) {
        const tickRes = await fetch(`${API_BASE_URL}/projects/impressa/tickets`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (tickRes.ok) {
          const tickData = await tickRes.json();
          setTickets(tickData);
        } else {
          const err = await tickRes.json();
          setMsg({ type: 'error', text: err.error || 'Failed to fetch customer support tickets.' });
        }
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Network connection failure. Unable to contact Impressa control server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpressaData();
  }, [token]);

  // Real-time WebSocket sync
  useEffect(() => {
    if (!socket) return;

    const handleApprovalsUpdated = (data) => {
      setApprovals(data);
    };

    const handleTicketsUpdated = (data) => {
      setTickets(data);
    };

    socket.on('impressa_approvals_updated', handleApprovalsUpdated);
    socket.on('impressa_tickets_updated', handleTicketsUpdated);

    return () => {
      socket.off('impressa_approvals_updated', handleApprovalsUpdated);
      socket.off('impressa_tickets_updated', handleTicketsUpdated);
    };
  }, [socket]);

  const handleUpdateProductStatus = async (id, status) => {
    if (processingProduct) return;
    setProcessingProduct({ id, action: status });

    try {
      const response = await fetch(`${API_BASE_URL}/projects/impressa/approvals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          note: `Processed by Inzozi MIS Admin (${user.name})`
        })
      });

      if (response.ok) {
        setMsg({
          type: 'success',
          text: `Product successfully ${status === 'approved' ? 'approved' : 'rejected'}!`
        });
        // Filter locally immediately, socket broadcast will sync with other tabs
        setApprovals(prev => prev.filter(p => p.id !== id));
        setTimeout(() => setMsg(null), 3000);
      } else {
        const err = await response.json();
        setMsg({ type: 'error', text: err.error || 'Failed to update product status.' });
        setTimeout(() => setMsg(null), 4000);
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to process request due to network instability.' });
      setTimeout(() => setMsg(null), 4000);
    } finally {
      setProcessingProduct(null);
    }
  };

  const handleUpdateTicketStatus = async (id, status) => {
    if (processingTicket) return;
    setProcessingTicket({ id, action: status });

    try {
      const response = await fetch(`${API_BASE_URL}/projects/impressa/tickets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          replyText: status === 'resolved' ? replyText : undefined
        })
      });

      if (response.ok) {
        setMsg({
          type: 'success',
          text: `Ticket successfully ${status === 'resolved' ? 'resolved' : 'marked in progress'}!`
        });
        
        if (status === 'resolved') {
          setTickets(prev => prev.filter(t => t.id !== id));
          setSelectedTicketId(null);
          setReplyText('');
        } else {
          setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'in_progress' } : t));
        }
        setTimeout(() => setMsg(null), 3000);
      } else {
        const err = await response.json();
        setMsg({ type: 'error', text: err.error || 'Failed to update ticket status.' });
        setTimeout(() => setMsg(null), 4000);
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Network request failed. Could not sync ticket status.' });
      setTimeout(() => setMsg(null), 4000);
    } finally {
      setProcessingTicket(null);
    }
  };

  // Determine dynamic columns based on access rights
  let leftColumnSpan = "md:col-span-8";
  let rightColumnSpan = "md:col-span-4";

  if (canApproveProducts && !canManageTickets) {
    leftColumnSpan = "md:col-span-12";
  } else if (!canApproveProducts && canManageTickets) {
    rightColumnSpan = "md:col-span-12";
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col min-h-0 overflow-hidden">
      
      {/* View Header */}
      <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-950/20 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-purple-500/10 transition-colors duration-500" />
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-purple-400" />
            Impressa Command Center
          </h1>
          <p className="text-slate-400 text-xs mt-1">Control Plane operations for seller catalogue approvals and user support tickets</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 rounded-xl">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          Realtime Stream Connected
        </div>
      </div>

      {/* Styled Notifications Banner */}
      {msg && (
        <div className={`p-4 rounded-xl border shrink-0 flex items-center gap-3 text-xs font-semibold shadow-lg transition-all duration-300 animate-fade-in ${
          msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-950/10' : 'bg-red-500/10 border-red-500/20 text-red-400 shadow-red-950/10'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{msg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            <span className="text-slate-450 text-xs font-semibold tracking-wider uppercase animate-pulse">Syncing queues...</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid md:grid-cols-12 gap-8 min-h-0 overflow-hidden pb-4">
          
          {/* Left Column: Product Approvals catalog */}
          {canApproveProducts && (
            <div className={`${leftColumnSpan} flex flex-col min-h-0 overflow-hidden space-y-4`}>
              <div className="flex justify-between items-center shrink-0">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-purple-400" />
                  Product Approvals Backlog
                </h3>
                <span className="text-[10px] bg-slate-950 px-2.5 py-0.5 border border-slate-850 rounded-full text-slate-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                  {approvals.length} pending
                </span>
              </div>

              <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                {approvals.length === 0 ? (
                  <div className="h-44 border border-dashed border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-slate-600">
                      <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-300">Catalog queue is clear</h4>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">All vendor products uploaded to the Impressa storefront have been approved or rejected.</p>
                  </div>
                ) : (
                  approvals.map((prod) => {
                    const isRejecting = processingProduct?.id === prod.id && processingProduct?.action === 'rejected';
                    const isApproving = processingProduct?.id === prod.id && processingProduct?.action === 'approved';
                    const isAnyProcessing = processingProduct?.id === prod.id;

                    return (
                      <div 
                        key={prod.id} 
                        className="bg-slate-950/80 backdrop-blur-sm border border-slate-850 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-800 transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        <div className="flex items-center gap-4">
                          <img 
                            src={prod.image} 
                            alt={prod.name} 
                            className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-850 shrink-0"
                          />
                          <div className="space-y-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-200 leading-snug truncate">{prod.name}</h4>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500 font-semibold">
                              <span className="text-slate-400">By: {prod.sellerName}</span>
                              <span>•</span>
                              <span>Category: {prod.category}</span>
                              <span>•</span>
                              <span className="text-purple-400">${prod.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2.5 w-full sm:w-auto self-stretch sm:self-auto pt-2.5 sm:pt-0 border-t border-slate-900 sm:border-0 shrink-0">
                          <button
                            disabled={processingProduct !== null}
                            onClick={() => handleUpdateProductStatus(prod.id, 'rejected')}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
                          >
                            {isRejecting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                            Reject
                          </button>
                          <button
                            disabled={processingProduct !== null}
                            onClick={() => handleUpdateProductStatus(prod.id, 'approved')}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
                          >
                            {isApproving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            Approve
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Right Column: Support Tickets list */}
          {canManageTickets && (
            <div className={`${rightColumnSpan} flex flex-col min-h-0 overflow-hidden space-y-4`}>
              <div className="flex justify-between items-center shrink-0">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4.5 h-4.5 text-purple-400" />
                  Active Support Tickets
                </h3>
                <span className="text-[10px] bg-slate-950 px-2.5 py-0.5 border border-slate-850 rounded-full text-slate-400 font-bold">
                  {tickets.length} unresolved
                </span>
              </div>

              <div className="flex-grow overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {tickets.length === 0 ? (
                  <div className="h-44 border border-dashed border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-850 flex items-center justify-center text-slate-650">
                      <HelpCircle className="w-5 h-5 text-slate-500" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-400">No support requests</h4>
                    <p className="text-xs text-slate-500 max-w-xs">All shopper tickets are currently resolved.</p>
                  </div>
                ) : (
                  tickets.map((tick) => {
                    const isSelected = selectedTicketId === tick.id;
                    const isResolving = processingTicket?.id === tick.id && processingTicket?.action === 'resolved';
                    const isProgressing = processingTicket?.id === tick.id && processingTicket?.action === 'in_progress';
                    const isAnyTicketProcessing = processingTicket !== null;

                    return (
                      <div 
                        key={tick.id} 
                        className={`bg-slate-950/80 backdrop-blur-sm border rounded-xl p-4 transition-all duration-300 flex flex-col gap-3 ${
                          isSelected ? 'border-purple-500/40 ring-1 ring-purple-500/10' : 'border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        {/* Header Details */}
                        <div 
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTicketId(null);
                              setReplyText('');
                            } else {
                              setSelectedTicketId(tick.id);
                              setReplyText('');
                            }
                          }}
                          className="flex justify-between items-start gap-2 cursor-pointer"
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-200 leading-snug group-hover:text-purple-400 transition-colors">{tick.subject}</h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                              <span className="truncate max-w-[150px]">{tick.userEmail}</span>
                              <span>•</span>
                              <span className="uppercase text-purple-450 font-bold">{tick.status.replace('_', ' ')}</span>
                            </div>
                          </div>
                          
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shrink-0 border ${
                            tick.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' : 'bg-slate-900 border-slate-850 text-slate-500'
                          }`}>
                            {tick.priority}
                          </span>
                        </div>

                        {/* Interactive Drawer (Expanded) */}
                        {isSelected && (
                          <div className="pt-2 border-t border-slate-900 space-y-3 animate-fade-in">
                            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-850/80 flex gap-2">
                              <User className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-slate-500 font-semibold">Shopper Escalation:</span>
                                <p className="text-[10.5px] text-slate-400 leading-normal">
                                  Customer submitted an inquiry regarding this issue. Please draft a message and mark the issue status accordingly.
                                </p>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Draft Response</label>
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type reply message here..."
                                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500 resize-none h-20 transition-colors"
                              />
                            </div>

                            <div className="flex gap-2">
                              {tick.status === 'open' && (
                                <button
                                  disabled={isAnyTicketProcessing}
                                  onClick={() => handleUpdateTicketStatus(tick.id, 'in_progress')}
                                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-slate-905 hover:bg-slate-800 border border-slate-800 text-slate-450 hover:text-slate-200 rounded-lg text-[10.5px] font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
                                >
                                  {isProgressing ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Clock className="w-3.5 h-3.5" />
                                  )}
                                  In Progress
                                </button>
                              )}

                              <button
                                disabled={isAnyTicketProcessing || !replyText.trim()}
                                onClick={() => handleUpdateTicketStatus(tick.id, 'resolved')}
                                className="flex-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-400 rounded-lg text-[10.5px] font-bold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
                              >
                                {isResolving ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Send className="w-3.5 h-3.5" />
                                )}
                                Send Response & Resolve
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default ImpressaAdmin;

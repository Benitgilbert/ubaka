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
  User,
  Lock,
  Plus,
  Trash2,
  Edit2,
  ShieldAlert,
  Search,
  CheckCircle,
  Building,
  DollarSign,
  Briefcase,
  Layers,
  Star,
  Bot,
  UserCheck,
  Tag,
  Gift,
  Flame,
  Image as ImageIcon,
  MessageCircle,
  BookOpen,
  PieChart,
  Percent,
  Globe,
  Settings as SettingsIcon,
  Mail,
  Truck,
  FileSpreadsheet,
  ArrowLeft
} from 'lucide-react';

const ALL_TABS = [
  { id: 'shifts', label: 'Shifts Log', permission: 'manage_impressa_shifts', category: 'Overview', icon: Clock, desc: 'Track cashier drawer sessions and POS reconciliation.' },
  { id: 'finance', label: 'Finance Book', permission: 'manage_impressa_finance', category: 'Overview', icon: DollarSign, desc: 'View double-entry ledger accounts and transactions.' },
  { id: 'commissions', label: 'Commissions', permission: 'manage_impressa_commissions', category: 'Overview', icon: Percent, desc: 'Configure Online vs. POS checkout fee rates.' },
  { id: 'payouts', label: 'Merchant Payouts', permission: 'manage_impressa_payouts', category: 'Overview', icon: DollarSign, desc: 'Process payouts and withdrawals to seller MoMo/Bank.' },
  { id: 'reports', label: 'Report Logs', permission: 'manage_impressa_reports', category: 'Overview', icon: FileSpreadsheet, desc: 'Download generated sales, tax, and inventory reports.' },
  
  { id: 'users', label: 'Users', permission: 'manage_impressa_users', category: 'Management', icon: User, desc: 'Manage e-commerce shoppers, cashiers, and staff accounts.' },
  { id: 'sellers', label: 'Sellers', permission: 'manage_impressa_sellers', category: 'Management', icon: Building, desc: 'Review, enable, or freeze partner merchant stores.' },
  { id: 'violations', label: 'Violations', permission: 'manage_impressa_violations', category: 'Management', icon: ShieldAlert, desc: 'Track and issue seller policy infraction points.' },
  { id: 'seller_reports', label: 'Seller Performance', permission: 'view_impressa_seller_reports', category: 'Management', icon: PieChart, desc: 'View analytics reports for registered vendors.' },
  { id: 'orders', label: 'Orders', permission: 'manage_impressa_orders', category: 'Management', icon: ShoppingBag, desc: 'Process customer product orders and checkouts.' },
  { id: 'inquiries', label: 'Quotes & Inquiries', permission: 'manage_impressa_inquiries', category: 'Management', icon: HelpCircle, desc: 'Respond to customer custom quote and print requests.' },
  { id: 'products', label: 'Products', permission: 'manage_impressa_products', category: 'Management', icon: Layers, desc: 'Manage vendor catalog inventory and simple/variable products.' },
  { id: 'approvals', label: 'Product Approvals', permission: 'approve_impressa_products', category: 'Management', icon: CheckCircle, desc: 'Approve or reject pending vendor catalog products.' },
  { id: 'categories', label: 'Categories', permission: 'manage_impressa_categories', category: 'Management', icon: Briefcase, desc: 'Configure product collections and categories.' },
  { id: 'attributes', label: 'Attributes', permission: 'manage_impressa_attributes', category: 'Management', icon: Tag, desc: 'Configure product attributes like color and size variations.' },
  { id: 'reviews', label: 'Reviews', permission: 'manage_impressa_reviews', category: 'Management', icon: Star, desc: 'Audit and moderate product star reviews.' },
  { id: 'tickets', label: 'Support Tickets', permission: 'manage_impressa_tickets', category: 'Management', icon: MessageSquare, desc: 'Respond to and resolve customer support tickets.' },
  { id: 'customer_queries', label: 'AI Customer Queries', permission: 'manage_impressa_customer_queries', category: 'Management', icon: Bot, desc: 'Audit and monitor AI chatbot client log interactions.' },
  { id: 'abonnes', label: 'Client AbonnÃ©s', permission: 'manage_impressa_abonnes', category: 'Management', icon: UserCheck, desc: 'Track credit balances and limits for loyal client abonnÃ©s.' },
  
  { id: 'coupons', label: 'Coupons', permission: 'manage_impressa_coupons', category: 'Marketing', icon: Tag, desc: 'Create promotional discount codes and coupons.' },
  { id: 'gift_cards', label: 'Gift Cards', permission: 'manage_impressa_gift_cards', category: 'Marketing', icon: Gift, desc: 'Track issued customer gift codes.' },
  { id: 'gift_card_products', label: 'Gift Card Products', permission: 'manage_impressa_gift_card_products', category: 'Marketing', icon: Gift, desc: 'Configure buyable gift card options.' },
  { id: 'flash_sales', label: 'Flash Sales', permission: 'manage_impressa_flash_sales', category: 'Marketing', icon: Flame, desc: 'Set up time-limited e-commerce marketing promotions.' },
  { id: 'banners', label: 'Landing Banners', permission: 'manage_impressa_banners', category: 'Marketing', icon: ImageIcon, desc: 'Update homepage promotional banners and sliders.' },
  { id: 'testimonials', label: 'Testimonials', permission: 'manage_impressa_testimonials', category: 'Marketing', icon: MessageCircle, desc: 'Moderate client system review quotes.' },
  { id: 'blogs', label: 'Blogs Management', permission: 'manage_impressa_blogs', category: 'Marketing', icon: BookOpen, desc: 'Draft and publish promotional blog articles.' },
  { id: 'brand_partners', label: 'Brand Partners', permission: 'manage_impressa_brand_partners', category: 'Marketing', icon: UserCheck, desc: 'Manage partner vendor brand logos.' },
  
  { id: 'site_settings', label: 'Site Settings', permission: 'manage_impressa_site_settings', category: 'Configuration', icon: Globe, desc: 'Configure company tagline, emails, and global rates.' },
  { id: 'subscribers', label: 'Subscribers', permission: 'manage_impressa_subscribers', category: 'Configuration', icon: Mail, desc: 'View newsletter email subscribers.' },
  { id: 'delivery', label: 'Delivery Config', permission: 'manage_impressa_delivery', category: 'Configuration', icon: Truck, desc: 'Manage shipping zones and delivery methods.' },
  { id: 'taxes', label: 'Tax Rates', permission: 'manage_impressa_taxes', category: 'Configuration', icon: Percent, desc: 'Set up value added tax rates.' },
  { id: 'settings', label: 'Settings', permission: 'manage_impressa_settings', category: 'Configuration', icon: SettingsIcon, desc: 'Configure technical backend settings.' }
];

const FORM_SCHEMAS = {
  users: [
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'email', label: 'Email Address', type: 'email', required: true },
    { name: 'role', label: 'System Role', type: 'select', options: ['admin', 'owner', 'cashier', 'inventory', 'delivery', 'customer', 'seller'], required: true }
  ],
  sellers: [
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'email', label: 'Email Address', type: 'email', required: true },
    { name: 'storeName', label: 'Store Name', type: 'text', required: true },
    { name: 'sellerStatus', label: 'Verification Status', type: 'select', options: ['pending', 'active', 'rejected'], required: true }
  ],
  violations: [
    { name: 'sellerId', label: 'Seller User ID', type: 'text', required: true },
    { name: 'type', label: 'Violation Type', type: 'text', required: true },
    { name: 'severity', label: 'Severity Level', type: 'select', options: ['low', 'medium', 'high'], required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['active', 'resolved'], required: true },
    { name: 'penaltyPoints', label: 'Penalty Points', type: 'number', required: true },
    { name: 'description', label: 'Description/Notes', type: 'textarea' }
  ],
  coupons: [
    { name: 'code', label: 'Promo Code', type: 'text', required: true },
    { name: 'type', label: 'Discount Type', type: 'select', options: ['fixed', 'percentage', 'free_shipping'], required: true },
    { name: 'value', label: 'Discount Value', type: 'number', required: true },
    { name: 'minSpend', label: 'Minimum Spend Limit', type: 'number' },
    { name: 'usageLimit', label: 'Max Usage Limit', type: 'number' },
    { name: 'expiresAt', label: 'Expiration Date', type: 'date', required: true },
    { name: 'isActive', label: 'Is Active', type: 'checkbox' }
  ],
  gift_cards: [
    { name: 'code', label: 'Gift Code', type: 'text', required: true },
    { name: 'initialAmount', label: 'Initial Amount', type: 'number', required: true },
    { name: 'currentBalance', label: 'Current Balance', type: 'number', required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Redeemed', 'Expired', 'Voided'], required: true },
    { name: 'recipientEmail', label: 'Recipient Email', type: 'email' }
  ],
  gift_card_products: [
    { name: 'label', label: 'Card Label', type: 'text', required: true },
    { name: 'amount', label: 'Value Amount', type: 'number', required: true },
    { name: 'color', label: 'Card Gradient Color', type: 'text', required: true },
    { name: 'expiryDays', label: 'Expiry Days', type: 'number', required: true },
    { name: 'isActive', label: 'Is Active', type: 'checkbox' }
  ],
  flash_sales: [
    { name: 'name', label: 'Campaign Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'startDate', label: 'Start Date & Time', type: 'date', required: true },
    { name: 'endDate', label: 'End Date & Time', type: 'date', required: true },
    { name: 'isActive', label: 'Is Campaign Active', type: 'checkbox' }
  ],
  banners: [
    { name: 'title', label: 'Banner Title', type: 'text', required: true },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'badge', label: 'Promo Badge Text', type: 'text' },
    { name: 'buttonText', label: 'CTA Button Text', type: 'text' },
    { name: 'buttonLink', label: 'CTA Button Link', type: 'text' },
    { name: 'isActive', label: 'Is Displayed', type: 'checkbox' }
  ],
  testimonials: [
    { name: 'name', label: 'Author Name', type: 'text', required: true },
    { name: 'role', label: 'Author Job/Role', type: 'text', required: true },
    { name: 'content', label: 'Feedback Review Text', type: 'textarea', required: true },
    { name: 'rating', label: 'Star Rating (1-5)', type: 'number', required: true },
    { name: 'isActive', label: 'Is Displayed', type: 'checkbox' }
  ],
  blogs: [
    { name: 'title', label: 'Article Title', type: 'text', required: true },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true },
    { name: 'content', label: 'Markdown Content Body', type: 'textarea', required: true },
    { name: 'excerpt', label: 'Short Excerpt Summary', type: 'text' },
    { name: 'isActive', label: 'Publish Immediately', type: 'checkbox' }
  ],
  brand_partners: [
    { name: 'name', label: 'Partner Name', type: 'text', required: true },
    { name: 'logo', label: 'Logo Image URL', type: 'text' },
    { name: 'link', label: 'Partner Link URL', type: 'text' },
    { name: 'isActive', label: 'Is Active', type: 'checkbox' }
  ],
  subscribers: [
    { name: 'email', label: 'Email Address', type: 'email', required: true },
    { name: 'isActive', label: 'Is Subscribed', type: 'checkbox' }
  ],
  taxes: [
    { name: 'name', label: 'Tax Name', type: 'text', required: true },
    { name: 'rate', label: 'Tax Percentage (%)', type: 'number', required: true },
    { name: 'taxClass', label: 'Tax Category Class', type: 'text', required: true }
  ],
  commissions: [
    { name: 'defaultRate', label: 'Online Commission Rate (%)', type: 'number', required: true },
    { name: 'posRate', label: 'POS Commission Rate (%)', type: 'number', required: true },
    { name: 'minimumPayoutAmount', label: 'Minimum Payout Amount (RWF)', type: 'number', required: true },
    { name: 'payoutSchedule', label: 'Payout Schedule Frequency', type: 'select', options: ['daily', 'weekly', 'monthly'], required: true }
  ],
  site_settings: [
    { name: 'siteName', label: 'Website Name', type: 'text', required: true },
    { name: 'tagline', label: 'Slogan Tagline', type: 'text' },
    { name: 'contactEmail', label: 'Support Email', type: 'email', required: true },
    { name: 'contactPhone', label: 'Support Phone', type: 'text' },
    { name: 'commissionRate', label: 'Platform Fee commissionRate (%)', type: 'number', required: true }
  ],
  settings: [
    { name: 'siteName', label: 'Website Name', type: 'text', required: true },
    { name: 'tagline', label: 'Slogan Tagline', type: 'text' },
    { name: 'contactEmail', label: 'Support Email', type: 'email', required: true },
    { name: 'contactPhone', label: 'Support Phone', type: 'text' },
    { name: 'commissionRate', label: 'Platform Fee commissionRate (%)', type: 'number', required: true }
  ]
};

const ImpressaAdmin = () => {
  const { token, user } = useAuth();
  const socket = useSocket();
  
  // Navigation State (null represents the Main Grid Hub Dashboard)
  const [selectedFeature, setSelectedFeature] = useState(null);
  
  // Custom states for Approvals/Tickets (Existing high-fidelity screens)
  const [approvals, setApprovals] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [processingProduct, setProcessingProduct] = useState(null);
  const [processingTicket, setProcessingTicket] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Generic Data States for remaining 30 tables
  const [genericData, setGenericData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hubSearchQuery, setHubSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editRecordId, setEditRecordId] = useState(null);
  const [formData, setFormData] = useState({});

  const userPermissions = user?.permissions || [];

  // Group tabs by category
  const categories = ['Overview', 'Management', 'Marketing', 'Configuration'];
  
  // Sync Data on Tab Switch
  useEffect(() => {
    if (selectedFeature) {
      fetchTabData();
    }
  }, [selectedFeature, token]);

  const fetchTabData = async () => {
    setLoading(true);
    setMsg(null);
    setGenericData([]);
    
    const activeTabConfig = ALL_TABS.find(t => t.id === selectedFeature);
    if (!activeTabConfig) return;

    // Check permissions client-side
    if (activeTabConfig.permission && !userPermissions.includes(activeTabConfig.permission)) {
      setLoading(false);
      return;
    }

    try {
      if (selectedFeature === 'approvals') {
        const appRes = await fetch(`${API_BASE_URL}/projects/impressa/approvals`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (appRes.ok) {
          const appData = await appRes.json();
          setApprovals(appData);
        }
      } else if (selectedFeature === 'tickets') {
        const tickRes = await fetch(`${API_BASE_URL}/projects/impressa/tickets`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (tickRes.ok) {
          const tickData = await tickRes.json();
          setTickets(tickData);
        }
      } else {
        // Generic CRUD fetcher
        const res = await fetch(`${API_BASE_URL}/projects/impressa/data/${selectedFeature}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setGenericData(data);
        } else {
          const err = await res.json();
          setMsg({ type: 'error', text: err.error || `Failed to fetch data for ${activeTabConfig.label}.` });
        }
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Network connection failure. Unable to contact Kuri Macye control server.' });
    } finally {
      setLoading(false);
    }
  };

  // Real-time WebSocket sync for approvals/tickets
  useEffect(() => {
    if (!socket) return;

    const handleApprovalsUpdated = (data) => {
      if (selectedFeature === 'approvals') setApprovals(data);
    };

    const handleTicketsUpdated = (data) => {
      if (selectedFeature === 'tickets') setTickets(data);
    };

    socket.on('impressa_approvals_updated', handleApprovalsUpdated);
    socket.on('impressa_tickets_updated', handleTicketsUpdated);

    return () => {
      socket.off('impressa_approvals_updated', handleApprovalsUpdated);
      socket.off('impressa_tickets_updated', handleTicketsUpdated);
    };
  }, [socket, selectedFeature]);

  // Product Approvals Action
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
          note: `Processed by Ubaka Tech MIS Admin (${user.name})`
        })
      });

      if (response.ok) {
        setMsg({
          type: 'success',
          text: `Product successfully ${status === 'approved' ? 'approved' : 'rejected'}!`
        });
        setApprovals(prev => prev.filter(p => p.id !== id));
        setTimeout(() => setMsg(null), 3000);
      } else {
        const err = await response.json();
        setMsg({ type: 'error', text: err.error || 'Failed to update product status.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to process request due to network instability.' });
    } finally {
      setProcessingProduct(null);
    }
  };

  // Support Ticket Action
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
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Network request failed. Could not sync ticket status.' });
    } finally {
      setProcessingTicket(null);
    }
  };

  // Generic CRUD Delete
  const handleGenericDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/projects/impressa/data/${selectedFeature}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMsg({ type: 'success', text: 'Record successfully deleted!' });
        setGenericData(prev => prev.filter(item => item.id !== id));
        setTimeout(() => setMsg(null), 3000);
      } else {
        const err = await response.json();
        setMsg({ type: 'error', text: err.error || 'Failed to delete record.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to process delete request.' });
    }
  };

  // Generic CRUD Submit (Create or Update)
  const handleGenericSubmit = async (e) => {
    e.preventDefault();
    const method = modalMode === 'create' ? 'POST' : 'PUT';
    const url = modalMode === 'create' 
      ? `${API_BASE_URL}/projects/impressa/data/${selectedFeature}`
      : `${API_BASE_URL}/projects/impressa/data/${selectedFeature}/${editRecordId}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setMsg({ type: 'success', text: `Record successfully ${modalMode === 'create' ? 'created' : 'updated'}!` });
        setShowModal(false);
        fetchTabData();
        setTimeout(() => setMsg(null), 3000);
      } else {
        const err = await response.json();
        setMsg({ type: 'error', text: err.error || 'Failed to save record.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to dispatch form details.' });
    }
  };

  // Open creation modal
  const openCreateModal = () => {
    const fields = FORM_SCHEMAS[selectedFeature] || [];
    const initialForm = {};
    fields.forEach(f => {
      initialForm[f.name] = f.type === 'checkbox' ? false : '';
    });
    setFormData(initialForm);
    setModalMode('create');
    setEditRecordId(null);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (record) => {
    const fields = FORM_SCHEMAS[selectedFeature] || [];
    const formVals = {};
    fields.forEach(f => {
      formVals[f.name] = record[f.name] !== undefined ? record[f.name] : '';
    });
    setFormData(formVals);
    setModalMode('edit');
    setEditRecordId(record.id);
    setShowModal(true);
  };

  // Get active tab configuration
  const activeTabConfig = ALL_TABS.find(t => t.id === selectedFeature);
  const isAuthorized = !activeTabConfig || !activeTabConfig.permission || userPermissions.includes(activeTabConfig.permission);

  // Filter items in generic view based on search
  const filteredData = genericData.filter(item => {
    if (!searchQuery) return true;
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filter hub grid based on hub search
  const filteredHubFeatures = ALL_TABS.filter(tab => {
    if (!hubSearchQuery) return true;
    return tab.label.toLowerCase().includes(hubSearchQuery.toLowerCase()) || 
           tab.desc.toLowerCase().includes(hubSearchQuery.toLowerCase()) || 
           tab.category.toLowerCase().includes(hubSearchQuery.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-slate-950 p-8 max-w-7xl mx-auto w-full select-none h-screen relative">
      
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Styled Notifications Banner */}
      {msg && (
        <div className={`p-4 rounded-xl border shrink-0 flex items-center gap-3 text-xs font-semibold shadow-lg transition-all duration-300 animate-fade-in mb-6 ${
          msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{msg.text}</span>
        </div>
      )}

      {selectedFeature === null ? (
        /* ==================== 1. LANDING HUB GRID VIEW ==================== */
        <div className="space-y-8 animate-fade-in">
          
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-950/20 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-purple-500/10 transition-colors duration-500" />
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <ShoppingBag className="w-6 h-6 text-purple-400 animate-pulse" />
                Kuri Macye Control Hub
              </h1>
              <p className="text-slate-400 text-xs mt-1">Unified administrative command center for local commerce, checkout settings, and seller logs</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 rounded-xl">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Ecosystem Stream Active
            </div>
          </div>

          {/* Hub Search Tool */}
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-550" />
            </span>
            <input
              type="text"
              value={hubSearchQuery}
              onChange={(e) => setHubSearchQuery(e.target.value)}
              placeholder="Search e-commerce tools (e.g. Coupons, Shifts)..."
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none focus:border-purple-500/50 transition-colors placeholder-slate-500"
            />
          </div>

          {/* Grouped Category Cards Grid */}
          <div className="space-y-8">
            {categories.map(cat => {
              const catTabs = filteredHubFeatures.filter(t => t.category === cat);
              if (catTabs.length === 0) return null;

              return (
                <div key={cat} className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                    <span className="text-xs font-black text-slate-450 uppercase tracking-widest">{cat} Operations</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {catTabs.map(tab => {
                      const TabIcon = tab.icon || ShoppingBag;
                      const hasAccess = userPermissions.includes(tab.permission);
                      
                      return (
                        <div
                          key={tab.id}
                          onClick={() => {
                            if (hasAccess) {
                              setSelectedFeature(tab.id);
                            } else {
                              setMsg({ type: 'error', text: `Access restricted. You lack the privilege '${tab.permission}' to view this feature.` });
                              setTimeout(() => setMsg(null), 4000);
                            }
                          }}
                          className={`relative border p-5 rounded-2xl flex flex-col justify-between h-40 transition-all duration-300 group cursor-pointer ${
                            hasAccess 
                              ? 'bg-slate-900/20 border-slate-850 hover:border-purple-500/40 hover:bg-slate-900/50 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-0.5'
                              : 'bg-slate-950/60 border-slate-900/80 opacity-55 hover:border-slate-800'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div className={`p-2.5 rounded-xl border ${
                                hasAccess 
                                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300'
                                  : 'bg-slate-900 border-slate-850 text-slate-600'
                              } transition-colors`}>
                                <TabIcon className="w-4.5 h-4.5" />
                              </div>
                              
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wide border ${
                                hasAccess
                                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                  : 'bg-slate-950 border-slate-850 text-slate-500'
                              }`}>
                                {hasAccess ? (
                                  <>
                                    <Check className="w-2.5 h-2.5" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-2.5 h-2.5" />
                                    Locked
                                  </>
                                )}
                              </span>
                            </div>
                            
                            <h3 className="text-xs font-black text-slate-200 tracking-tight leading-snug pt-1">{tab.label}</h3>
                            <p className="text-[10px] text-slate-500 leading-normal group-hover:text-slate-400 transition-colors line-clamp-2">{tab.desc}</p>
                          </div>

                          <div className="text-[8px] text-slate-600 font-mono select-none truncate">
                            {tab.permission || 'General Access'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* ==================== 2. INDIVIDUAL DETAIL VIEW ==================== */
        <div className="space-y-6 animate-fade-in flex flex-col flex-1 min-h-0 overflow-hidden">
          
          {/* Header Panel with Back Navigation */}
          <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-950/20 via-slate-900 to-slate-900 border border-slate-850 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-purple-500/10 transition-colors duration-500" />
            <div className="space-y-2">
              <button
                onClick={() => setSelectedFeature(null)}
                className="inline-flex items-center gap-1.5 text-xs text-purple-400 font-bold hover:text-purple-300 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Control Hub
              </button>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                {activeTabConfig.label}
              </h1>
              <p className="text-slate-400 text-xs">{activeTabConfig.desc}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400 rounded-xl">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
              Active View
            </div>
          </div>

          {/* Tab Content Enclosure */}
          {!isAuthorized ? (
            /* Permission Restriction Lock Layout (Fail-safe) */
            <div className="flex-grow flex items-center justify-center">
              <div className="max-w-md bg-slate-900/30 border border-slate-850 p-8 rounded-2xl text-center space-y-4 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto text-red-400">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-200">Access Restricted</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You do not have the required permission <strong className="text-red-450 font-mono font-bold bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">{activeTabConfig.permission}</strong> delegated to your account.
                </p>
                <p className="text-[10px] text-slate-550">
                  Return to the Control Hub or request temporary privilege coverage from your manager.
                </p>
              </div>
            </div>
          ) : loading ? (
            /* Loading State spinner */
            <div className="flex-grow flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase animate-pulse">Syncing database records...</span>
              </div>
            </div>
          ) : selectedFeature === 'approvals' ? (
            /* Custom View: Catalog Product Approvals */
            <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {approvals.length === 0 ? (
                <div className="h-44 border border-dashed border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-slate-650">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-300">Catalog queue is clear</h4>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">All vendor products uploaded to the Kuri Macye storefront have been approved or rejected.</p>
                </div>
              ) : (
                approvals.map((prod) => {
                  const isRejecting = processingProduct?.id === prod.id && processingProduct?.action === 'rejected';
                  const isApproving = processingProduct?.id === prod.id && processingProduct?.action === 'approved';
                  return (
                    <div 
                      key={prod.id} 
                      className="bg-slate-950/80 backdrop-blur-sm border border-slate-850 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-800 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <img 
                          src={prod.image || 'https://via.placeholder.com/150'} 
                          alt={prod.name} 
                          className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-850 shrink-0"
                        />
                        <div className="space-y-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-200 leading-snug truncate">{prod.name}</h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-550 font-semibold">
                            <span className="text-slate-400">By: {prod.sellerName}</span>
                            <span>â€¢</span>
                            <span>Category: {prod.category}</span>
                            <span>â€¢</span>
                            <span className="text-purple-400">{prod.price.toLocaleString()} Rwf</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2.5 w-full sm:w-auto self-stretch sm:self-auto pt-2.5 sm:pt-0 border-t border-slate-900 sm:border-0 shrink-0">
                        <button
                          disabled={processingProduct !== null}
                          onClick={() => handleUpdateProductStatus(prod.id, 'rejected')}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          {isRejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                          Reject
                        </button>
                        <button
                          disabled={processingProduct !== null}
                          onClick={() => handleUpdateProductStatus(prod.id, 'approved')}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : selectedFeature === 'tickets' ? (
            /* Custom View: Help & Support Tickets list */
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
                  
                  return (
                    <div 
                      key={tick.id} 
                      className={`bg-slate-950/80 backdrop-blur-sm border rounded-xl p-4 transition-all duration-300 flex flex-col gap-3 ${
                        isSelected ? 'border-purple-500/40 ring-1 ring-purple-500/10' : 'border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <div 
                        onClick={() => { setSelectedTicketId(isSelected ? null : tick.id); setReplyText(''); }}
                        className="flex justify-between items-start gap-2 cursor-pointer"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-200 leading-snug">{tick.subject}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-550 font-semibold">
                            <span className="truncate max-w-[150px]">{tick.userEmail}</span>
                            <span>â€¢</span>
                            <span className="uppercase text-purple-450 font-bold">{tick.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                          tick.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' : 'bg-slate-900 border-slate-850 text-slate-500'
                        }`}>
                          {tick.priority}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="pt-2 border-t border-slate-900 space-y-3 animate-fade-in">
                          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-850/80 flex gap-2">
                            <User className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-500 font-semibold">Shopper Message:</span>
                              <p className="text-[10.5px] text-slate-400 leading-normal">{tick.description}</p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Draft Response</label>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type reply message here..."
                              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-250 text-xs focus:outline-none focus:border-purple-500 resize-none h-20"
                            />
                          </div>

                          <div className="flex gap-2">
                            {tick.status === 'open' && (
                              <button
                                disabled={processingTicket !== null}
                                onClick={() => handleUpdateTicketStatus(tick.id, 'in_progress')}
                                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-250 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                              >
                                {isProgressing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                                In Progress
                              </button>
                            )}

                            <button
                              disabled={processingTicket !== null || !replyText.trim()}
                              onClick={() => handleUpdateTicketStatus(tick.id, 'resolved')}
                              className="flex-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-400 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                            >
                              {isResolving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                              Send & Resolve
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Generic CRUD View: Grid / Table for other 30 tables */
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-4">
              
              {/* Table search toolbar & Create action button */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 shrink-0">
                <div className="relative flex-1 max-w-sm">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs and records..."
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-slate-200 outline-none focus:border-purple-500/50"
                  />
                </div>

                {FORM_SCHEMAS[selectedFeature] && (
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all hover:shadow-lg hover:shadow-purple-500/5 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Record
                  </button>
                )}
              </div>

              {/* Table wrapper */}
              <div className="flex-grow bg-slate-900/20 border border-slate-850 rounded-xl overflow-hidden flex flex-col min-h-0">
                {filteredData.length === 0 ? (
                  <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <FileText className="w-10 h-10 text-slate-650" />
                    <h3 className="text-xs font-bold text-slate-350">No logs found</h3>
                    <p className="text-[10px] text-slate-550 max-w-xs leading-relaxed">No matching records available for active table query.</p>
                  </div>
                ) : (
                  <div className="flex-grow overflow-x-auto overflow-y-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse select-text">
                      <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-850 z-10">
                        <tr>
                          {Object.keys(filteredData[0]).filter(key => key !== 'id').map(key => (
                            <th key={key} className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{key}</th>
                          ))}
                          <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/50">
                        {filteredData.map((record) => (
                          <tr key={record.id} className="hover:bg-slate-900/30 transition-colors">
                            {Object.entries(record).filter(([key]) => key !== 'id').map(([key, val]) => (
                              <td key={key} className="px-5 py-3 text-xs text-slate-300 font-medium whitespace-nowrap max-w-xs truncate">
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </td>
                            ))}
                            <td className="px-5 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {FORM_SCHEMAS[selectedFeature] && (
                                  <button 
                                    onClick={() => openEditModal(record)}
                                    className="p-1.5 text-slate-450 hover:text-purple-400 bg-slate-950 hover:bg-purple-500/10 border border-slate-850 hover:border-purple-500/35 rounded-lg transition-all cursor-pointer"
                                    title="Edit record"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleGenericDelete(record.id)}
                                  className="p-1.5 text-slate-455 hover:text-red-400 bg-slate-950 hover:bg-red-500/10 border border-slate-850 hover:border-red-500/35 rounded-lg transition-all cursor-pointer"
                                  title="Delete record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* 3. Generic CREATE/EDIT Overlay Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/45 to-transparent" />
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-850">
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
                {modalMode === 'create' ? `Create ${activeTabConfig?.label}` : `Edit ${activeTabConfig?.label}`}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-450 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleGenericSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
              {(FORM_SCHEMAS[selectedFeature] || []).map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      required={field.required}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-purple-500 focus:bg-slate-950 transition-colors"
                    >
                      <option value="" className="text-slate-500">-- Select {field.label} --</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt} className="bg-slate-950 text-slate-200">{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      required={field.required}
                      placeholder={`Enter ${field.label}...`}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-purple-500 focus:bg-slate-950 transition-colors resize-none h-24"
                    />
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!formData[field.name]}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                        className="w-4.5 h-4.5 rounded border-slate-850 text-purple-600 focus:ring-purple-500/50 focus:ring-offset-slate-950 bg-slate-950 cursor-pointer"
                      />
                      <span className="text-xs text-slate-350 font-bold">{field.label}</span>
                    </label>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                      required={field.required}
                      placeholder={`Enter ${field.label}...`}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-purple-500 focus:bg-slate-950 transition-colors"
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  {modalMode === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ImpressaAdmin;


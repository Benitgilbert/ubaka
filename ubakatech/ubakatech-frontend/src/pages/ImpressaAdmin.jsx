import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  ShoppingBag, 
  Check, 
  X, 
  AlertCircle,
  AlertTriangle,
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
  ArrowLeft,
  Laptop,
  Smartphone,
  ArrowUp,
  ArrowDown,
  Shield,
  Headset,
  Undo
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
  { id: 'email_templates', label: 'Email Templates', permission: 'manage_impressa_email_templates', category: 'Configuration', icon: Mail, desc: 'Manage and preview dynamic transactional email templates.' },
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
    { name: 'payoutSchedule', label: 'Payout Schedule Frequency', type: 'select', options: ['daily', 'weekly', 'monthly'], required: true },
    { name: 'autoPayoutEnabled', label: 'Enable Automated Payouts', type: 'checkbox' },
    { name: 'maxAutoPayoutAmount', label: 'Max Auto Payout Amount (RWF)', type: 'number' },
    { name: 'sellerAutoApproval', label: 'Seller Auto Approval Config', type: 'textarea' }
  ],
  site_settings: [
    { name: 'siteName', label: 'Website Name', type: 'text', required: true },
    { name: 'tagline', label: 'Slogan Tagline', type: 'text' },
    { name: 'logo', label: 'Logo Image URL', type: 'text' },
    { name: 'footerTagline', label: 'Footer Description / Tagline', type: 'textarea' },
    { name: 'contactEmail', label: 'Support Email', type: 'email', required: true },
    { name: 'contactPhone', label: 'Support Phone', type: 'text' },
    { name: 'contactAddress', label: 'Contact Physical Address', type: 'text' },
    { name: 'googleMapsQuery', label: 'Google Maps Search Query', type: 'text' },
    { name: 'socialLinks', label: 'Social Media Links', type: 'social_links' },
    { name: 'trustBadges', label: 'Trust Badges', type: 'trust_badges' }
  ],
  delivery: [
    { name: 'name', label: 'Zone Name', type: 'text', required: true },
    { name: 'regions', label: 'Regions Covered', type: 'textarea', required: true },
    { name: 'methods', label: 'Shipping Methods', type: 'textarea', required: true },
    { name: 'isActive', label: 'Is Active', type: 'checkbox' }
  ],
  settings: [
    { name: 'siteName', label: 'Website Name', type: 'text', required: true },
    { name: 'tagline', label: 'Slogan Tagline', type: 'text' },
    { name: 'logo', label: 'Logo Image URL', type: 'text' },
    { name: 'footerTagline', label: 'Footer Description / Tagline', type: 'textarea' },
    { name: 'contactEmail', label: 'Support Email', type: 'email', required: true },
    { name: 'contactPhone', label: 'Support Phone', type: 'text' },
    { name: 'contactAddress', label: 'Contact Physical Address', type: 'text' },
    { name: 'googleMapsQuery', label: 'Google Maps Search Query', type: 'text' },
    { name: 'socialLinks', label: 'Social Media Links', type: 'social_links' },
    { name: 'trustBadges', label: 'Trust Badges', type: 'trust_badges' }
  ]
};

const BadgeIcon = ({ name, className }) => {
  switch (name) {
    case 'truck': return <Truck className={className} />;
    case 'shield': return <Shield className={className} />;
    case 'undo': return <Undo className={className} />;
    case 'headset': return <Headset className={className} />;
    case 'percent': return <Percent className={className} />;
    case 'tag': return <Tag className={className} />;
    case 'gift': return <Gift className={className} />;
    case 'check-circle': return <CheckCircle className={className} />;
    default: return <HelpCircle className={className} />;
  }
};

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const SocialLinksEditor = ({ value, onChange }) => {
  const links = value || { facebook: '', twitter: '', instagram: '', linkedin: '' };
  
  const updateLink = (platform, val) => {
    onChange({ ...links, [platform]: val });
  };

  return (
    <div className="space-y-3.5 p-4 bg-slate-950/40 rounded-xl border border-slate-850">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <FacebookIcon className="w-4 h-4 text-blue-500" />
          Facebook Link URL
        </label>
        <input
          type="text"
          value={links.facebook || ''}
          onChange={(e) => updateLink('facebook', e.target.value)}
          placeholder="https://facebook.com/username"
          className="w-full px-3 py-2 bg-slate-905 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-550 transition-colors"
        />
      </div>
      
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <TwitterIcon className="w-4 h-4 text-sky-400" />
          Twitter / X Link URL
        </label>
        <input
          type="text"
          value={links.twitter || ''}
          onChange={(e) => updateLink('twitter', e.target.value)}
          placeholder="https://twitter.com/username"
          className="w-full px-3 py-2 bg-slate-905 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-550 transition-colors"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <InstagramIcon className="w-4 h-4 text-pink-500" />
          Instagram Link URL
        </label>
        <input
          type="text"
          value={links.instagram || ''}
          onChange={(e) => updateLink('instagram', e.target.value)}
          placeholder="https://instagram.com/username"
          className="w-full px-3 py-2 bg-slate-905 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-550 transition-colors"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <LinkedinIcon className="w-4 h-4 text-blue-600" />
          LinkedIn Link URL
        </label>
        <input
          type="text"
          value={links.linkedin || ''}
          onChange={(e) => updateLink('linkedin', e.target.value)}
          placeholder="https://linkedin.com/company/username"
          className="w-full px-3 py-2 bg-slate-905 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-550 transition-colors"
        />
      </div>
    </div>
  );
};

const TrustBadgesEditor = ({ value, onChange }) => {
  const badges = Array.isArray(value) ? value : [];

  const updateBadgeField = (index, field, val) => {
    const updated = [...badges];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  const addBadge = () => {
    onChange([
      ...badges,
      {
        icon: 'truck',
        title: 'New Trust Badge',
        description: 'Description of the service benefit.',
        isActive: true,
        order: badges.length
      }
    ]);
  };

  const removeBadge = (index) => {
    const updated = badges.filter((_, i) => i !== index).map((b, i) => ({ ...b, order: i }));
    onChange(updated);
  };

  const moveBadge = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === badges.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...badges];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    const ordered = updated.map((b, i) => ({ ...b, order: i }));
    onChange(ordered);
  };

  const availableIcons = ['truck', 'shield', 'undo', 'headset', 'percent', 'tag', 'gift', 'check-circle'];

  return (
    <div className="space-y-4 p-4 bg-slate-950/40 rounded-xl border border-slate-850">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Active Trust Badges ({badges.length})</span>
        <button
          type="button"
          onClick={addBadge}
          className="px-2.5 py-1 bg-purple-650 hover:bg-purple-550 border border-purple-600 hover:border-purple-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
        >
          <Plus className="w-3 h-3" /> Add Badge
        </button>
      </div>

      {badges.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
          <p className="text-[10px] text-slate-500">No trust badges configured. Click Add Badge to start.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {badges.map((badge, index) => (
            <div key={index} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-3 relative group">
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <BadgeIcon name={badge.icon} className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[10px] font-bold text-purple-400">Badge #{index + 1}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveBadge(index, 'up')}
                    className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={index === badges.length - 1}
                    onClick={() => moveBadge(index, 'down')}
                    className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBadge(index)}
                    className="p-1 text-red-400 hover:text-red-350 hover:bg-red-500/10 rounded cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Icon Graphic</label>
                  <select
                    value={badge.icon || 'truck'}
                    onChange={(e) => updateBadgeField(index, 'icon', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-purple-550"
                  >
                    {availableIcons.map(ic => (
                      <option key={ic} value={ic}>{ic}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Badge Title</label>
                  <input
                    type="text"
                    value={badge.title || ''}
                    onChange={(e) => updateBadgeField(index, 'title', e.target.value)}
                    placeholder="e.g. Free Delivery"
                    className="w-full px-2.5 py-1.5 bg-slate-955 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-purple-550"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Benefit Description</label>
                  <input
                    type="text"
                    value={badge.description || ''}
                    onChange={(e) => updateBadgeField(index, 'description', e.target.value)}
                    placeholder="e.g. On orders over 50,000 Rwf"
                    className="w-full px-2.5 py-1.5 bg-slate-955 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-purple-550"
                  />
                </div>

                <div className="flex items-center gap-2 mt-1 sm:col-span-2 select-none">
                  <input
                    type="checkbox"
                    checked={badge.isActive !== false}
                    onChange={(e) => updateBadgeField(index, 'isActive', e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-purple-600 bg-slate-955 border-slate-850 focus:ring-purple-550"
                  />
                  <span className="text-[10px] font-bold text-slate-400">Display badge active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SellerAutoApprovalEditor = ({ value, onChange }) => {
  const autoApproval = value || { enabled: false, minScore: 70, criteria: { emailVerified: 30, phoneProvided: 20, storeNameSet: 20, storeDescriptionSet: 15, profilePhotoSet: 15 } };
  
  const updateField = (key, val) => {
    onChange({ ...autoApproval, [key]: val });
  };

  const updateCriteriaField = (criterion, val) => {
    const scoreVal = parseInt(val) || 0;
    onChange({
      ...autoApproval,
      criteria: {
        ...(autoApproval.criteria || { emailVerified: 30, phoneProvided: 20, storeNameSet: 20, storeDescriptionSet: 15, profilePhotoSet: 15 }),
        [criterion]: scoreVal
      }
    });
  };

  const criteria = autoApproval.criteria || { emailVerified: 30, phoneProvided: 20, storeNameSet: 20, storeDescriptionSet: 15, profilePhotoSet: 15 };

  return (
    <div className="space-y-4 p-4 bg-slate-950/40 rounded-xl border border-slate-850">
      <div className="flex items-center gap-3 select-none">
        <input
          type="checkbox"
          checked={!!autoApproval.enabled}
          onChange={(e) => updateField('enabled', e.target.checked)}
          className="w-4.5 h-4.5 rounded border-slate-800 text-purple-600 bg-slate-950 cursor-pointer focus:ring-purple-550"
        />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-200">Enable Auto-Approval on Application</span>
          <span className="text-[10px] text-slate-500">Automatically activate pending sellers based on profile details weight score.</span>
        </div>
      </div>

      {autoApproval.enabled && (
        <div className="space-y-4 pt-3 border-t border-slate-800/80">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                Minimum Eligibility Target Score
              </label>
              <span className="text-xs font-black text-purple-400">{autoApproval.minScore || 70}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={autoApproval.minScore || 70}
              onChange={(e) => updateField('minScore', parseInt(e.target.value))}
              className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-3">
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1">Completeness Weight Weights (%)</span>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <label className="text-[9px] text-slate-450 font-bold block">Email Verified</label>
                <input
                  type="number"
                  value={criteria.emailVerified ?? 30}
                  onChange={(e) => updateCriteriaField('emailVerified', e.target.value)}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <label className="text-[9px] text-slate-450 font-bold block">Phone Registered</label>
                <input
                  type="number"
                  value={criteria.phoneProvided ?? 20}
                  onChange={(e) => updateCriteriaField('phoneProvided', e.target.value)}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <label className="text-[9px] text-slate-450 font-bold block">Store Name Set</label>
                <input
                  type="number"
                  value={criteria.storeNameSet ?? 20}
                  onChange={(e) => updateCriteriaField('storeNameSet', e.target.value)}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <label className="text-[9px] text-slate-450 font-bold block">Description Provided</label>
                <input
                  type="number"
                  value={criteria.storeDescriptionSet ?? 15}
                  onChange={(e) => updateCriteriaField('storeDescriptionSet', e.target.value)}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 col-span-2">
                <label className="text-[9px] text-slate-455 font-bold block">Store Logo / Profile Photo Uploaded</label>
                <input
                  type="number"
                  value={criteria.profilePhotoSet ?? 15}
                  onChange={(e) => updateCriteriaField('profilePhotoSet', e.target.value)}
                  className="w-full px-2.5 py-1 bg-slate-955 border border-slate-800 rounded text-slate-300 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            
            <div className="text-[9px] text-slate-500 flex justify-between px-1.5 border-t border-slate-900 pt-2">
              <span>Combined check weights sum:</span>
              <span className="font-bold text-slate-400">
                {Object.values(criteria).reduce((a, b) => a + (parseInt(b) || 0), 0)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DeliveryFormEditor = ({ formData, setFormData }) => {
  const regions = Array.isArray(formData.regions) ? formData.regions : [];
  const methods = Array.isArray(formData.methods) ? formData.methods : [];

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleAddRegion = () => {
    const updated = [...regions, { province: '', district: '', sector: '', cell: '' }];
    updateField('regions', updated);
  };

  const handleRemoveRegion = (index) => {
    const updated = regions.filter((_, idx) => idx !== index);
    updateField('regions', updated);
  };

  const handleRegionChange = (index, field, value) => {
    const updated = regions.map((reg, idx) => {
      if (idx === index) {
        return { ...reg, [field]: value };
      }
      return reg;
    });
    updateField('regions', updated);
  };

  const handleAddMethod = () => {
    const updated = [
      ...methods,
      {
        id: `method_${Date.now()}`,
        name: '',
        cost: 0,
        type: 'flat_rate',
        isActive: true,
        minOrderAmount: 0
      }
    ];
    updateField('methods', updated);
  };

  const handleRemoveMethod = (index) => {
    const updated = methods.filter((_, idx) => idx !== index);
    updateField('methods', updated);
  };

  const handleMethodChange = (index, field, value) => {
    const updated = methods.map((met, idx) => {
      if (idx === index) {
        return { ...met, [field]: value };
      }
      return met;
    });
    updateField('methods', updated);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Zone Name */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Zone Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          required
          placeholder="e.g. Kigali City, Default, etc."
          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-purple-500 focus:bg-slate-950 transition-colors"
        />
      </div>

      {/* Regions Section */}
      <div className="space-y-3 border-t border-slate-855/60 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider">Regions Covered</h4>
            <p className="text-[10px] text-slate-500">Define target locations. Leave empty for Default catch-all zone.</p>
          </div>
          <button
            type="button"
            onClick={handleAddRegion}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Region
          </button>
        </div>

        {regions.length === 0 ? (
          <div className="p-4 bg-slate-955/40 border border-dashed border-slate-850 rounded-xl text-center text-[10.5px] text-slate-500 italic">
            No specific regions defined. This zone will act as a general fallback.
          </div>
        ) : (
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {regions.map((region, idx) => (
              <div key={idx} className="p-3 bg-slate-955/80 border border-slate-850 rounded-xl flex items-center gap-3 relative group">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Province</span>
                    <select
                      value={region.province || ''}
                      onChange={(e) => handleRegionChange(idx, 'province', e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-[11px] focus:outline-none focus:border-purple-550"
                    >
                      <option value="">Select Province</option>
                      <option value="Kigali City">Kigali City</option>
                      <option value="Eastern Province">Eastern Province</option>
                      <option value="Western Province">Western Province</option>
                      <option value="Northern Province">Northern Province</option>
                      <option value="Southern Province">Southern Province</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">District</span>
                    <input
                      type="text"
                      value={region.district || ''}
                      onChange={(e) => handleRegionChange(idx, 'district', e.target.value)}
                      placeholder="e.g. Nyarugenge"
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-[11px] focus:outline-none focus:border-purple-550"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Sector</span>
                    <input
                      type="text"
                      value={region.sector || ''}
                      onChange={(e) => handleRegionChange(idx, 'sector', e.target.value)}
                      placeholder="e.g. Kimisagara"
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-[11px] focus:outline-none focus:border-purple-550"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Cell</span>
                    <input
                      type="text"
                      value={region.cell || ''}
                      onChange={(e) => handleRegionChange(idx, 'cell', e.target.value)}
                      placeholder="e.g. Kamuhoza"
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-[11px] focus:outline-none focus:border-purple-550"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRegion(idx)}
                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 rounded-lg transition-colors cursor-pointer"
                  title="Remove Region"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Methods Section */}
      <div className="space-y-3 border-t border-slate-855/60 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider">Delivery Methods</h4>
            <p className="text-[10px] text-slate-550">Configure shipping methods and costs for this zone.</p>
          </div>
          <button
            type="button"
            onClick={handleAddMethod}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Method
          </button>
        </div>

        {methods.length === 0 ? (
          <div className="p-4 bg-slate-955/40 border border-dashed border-slate-850 rounded-xl text-center text-[10.5px] text-slate-500 italic">
            No shipping methods configured. Customers in this zone will have no shipping options.
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            {methods.map((method, idx) => (
              <div key={idx} className="p-4 bg-slate-955/80 border border-slate-850 rounded-xl space-y-3 relative group">
                <div className="flex justify-between items-center border-b border-slate-850/40 pb-2">
                  <span className="text-[9px] font-black text-purple-400 uppercase tracking-wider">Method #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMethod(idx)}
                    className="p-1 text-slate-550 hover:text-red-400 rounded transition-colors cursor-pointer"
                    title="Delete Method"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-slate-550 uppercase tracking-widest">Method Name</span>
                    <input
                      type="text"
                      value={method.name || ''}
                      onChange={(e) => handleMethodChange(idx, 'name', e.target.value)}
                      placeholder="e.g. Moto Delivery"
                      required
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-550"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-slate-555 uppercase tracking-widest">Base Cost (RWF)</span>
                    <input
                      type="number"
                      value={method.cost === undefined ? 0 : method.cost}
                      onChange={(e) => handleMethodChange(idx, 'cost', Number(e.target.value))}
                      placeholder="e.g. 1500"
                      required
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-550"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-slate-555 uppercase tracking-widest">Shipping Rule Type</span>
                    <select
                      value={method.type || 'flat_rate'}
                      onChange={(e) => handleMethodChange(idx, 'type', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-550"
                    >
                      <option value="flat_rate">Flat Rate</option>
                      <option value="free_shipping">Free Shipping</option>
                      <option value="local_pickup">Local Pickup</option>
                    </select>
                  </div>

                  {method.type === 'free_shipping' && (
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold text-slate-555 uppercase tracking-widest">Min Spend for Free (RWF)</span>
                      <input
                        type="number"
                        value={method.minOrderAmount === undefined ? 0 : method.minOrderAmount}
                        onChange={(e) => handleMethodChange(idx, 'minOrderAmount', Number(e.target.value))}
                        placeholder="e.g. 20000"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-550"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!method.isActive}
                      onChange={(e) => handleMethodChange(idx, 'isActive', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-800 text-purple-600 focus:ring-purple-500/50 focus:ring-offset-slate-950 bg-slate-900 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">Method Active</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Zone Active Toggle */}
      <div className="pt-4 border-t border-slate-855/60">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!formData.isActive}
            onChange={(e) => updateField('isActive', e.target.checked)}
            className="w-4.5 h-4.5 rounded border-slate-850 text-purple-600 focus:ring-purple-500/50 focus:ring-offset-slate-950 bg-slate-955 cursor-pointer"
          />
          <span className="text-xs text-slate-355 font-bold uppercase tracking-wider">Is Shipping Zone Active</span>
        </label>
      </div>
    </div>
  );
};

const renderCellContent = (key, val) => {
  // 1. Handle regions column
  if (key === 'regions') {
    let regions = [];
    if (typeof val === 'string') {
      try { regions = JSON.parse(val); } catch (e) { regions = []; }
    } else if (Array.isArray(val)) {
      regions = val;
    }
    if (!regions || regions.length === 0) {
      return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/60 text-slate-400 border border-slate-800">Default (All Regions)</span>;
    }
    const summaries = regions.map(r => {
      const parts = [r.province, r.district].filter(Boolean);
      return parts.join(' - ');
    }).filter(Boolean);
    const uniqueSummaries = [...new Set(summaries)];
    
    return (
      <div className="flex flex-wrap gap-1 max-w-xs">
        {uniqueSummaries.slice(0, 3).map((summary, idx) => (
          <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-purple-950/40 text-purple-300 border border-purple-900/40 whitespace-nowrap">
            {summary}
          </span>
        ))}
        {uniqueSummaries.length > 3 && (
          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-850 text-slate-400 border border-slate-800 whitespace-nowrap">
            +{uniqueSummaries.length - 3} more
          </span>
        )}
      </div>
    );
  }

  // 2. Handle methods column
  if (key === 'methods') {
    let methods = [];
    if (typeof val === 'string') {
      try { methods = JSON.parse(val); } catch (e) { methods = []; }
    } else if (Array.isArray(val)) {
      methods = val;
    }
    if (!methods || methods.length === 0) {
      return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950/30 text-red-400 border border-red-900/30">No Methods</span>;
    }
    return (
      <div className="flex flex-wrap gap-1 max-w-xs">
        {methods.map((m, idx) => {
          const costStr = m.type === 'free_shipping' ? 'Free' : `${m.cost?.toLocaleString() || 0} RWF`;
          const activeClass = m.isActive 
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/40' 
            : 'bg-slate-900/40 text-slate-500 border-slate-850';
          return (
            <span key={idx} className={`px-2 py-0.5 rounded text-[10px] border whitespace-nowrap ${activeClass}`}>
              {m.name || 'Unnamed'}: {costStr}
            </span>
          );
        })}
      </div>
    );
  }

  // 3. Handle Active / isActive status (boolean)
  if (key === 'isActive' || key === 'isPublished') {
    const active = val === true || val === 'true' || val === 1 || val === '1';
    return active ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-450 border border-slate-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        Inactive
      </span>
    );
  }

  // 4. Handle generic statuses and severity
  if (key === 'sellerStatus' || key === 'status' || key === 'severity') {
    const strVal = String(val).toLowerCase();
    let colorClass = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    if (['active', 'resolved', 'low', 'approved'].includes(strVal)) {
      colorClass = 'bg-emerald-500/10 text-emerald-405 border-emerald-500/20';
    } else if (['pending', 'medium'].includes(strVal)) {
      colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    } else if (['rejected', 'voided', 'expired', 'high'].includes(strVal)) {
      colorClass = 'bg-red-500/10 text-red-405 border-red-500/20';
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${colorClass}`}>
        {strVal}
      </span>
    );
  }

  // 5. Default fallback
  if (val !== undefined && typeof val === 'object' && val !== null) {
    return JSON.stringify(val);
  }
  return String(val);
};

const EmailTemplatesWorkspace = ({ token, API_BASE_URL, setMsg }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');

  const mockVariables = {
    customerName: "Jane Doe",
    orderNumber: "IMP-2026-9999",
    grandTotal: "45,000",
    paymentMethod: "MTN Mobile Money",
    date: new Date().toLocaleDateString(),
    trackUrl: "#",
    status: "DELIVERED",
    senderName: "John Smith",
    code: "GIFT-7788-CC11",
    amount: "25,000",
    message: "Hope you love this special gift!",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    shopUrl: "#",
    sellerName: "Bertrand Keza",
    storeName: "Kigali Tech Store",
    dashboardUrl: "#",
    reason: "Incomplete tax details supplied in registration forms.",
    productName: "Smart Solar Lantern",
    productUrl: "#",
    itemCount: 2,
    total: "30,000",
    violationType: "Late Order Fulfillment",
    description: "Vendor failed to process order within designated SLA times.",
    productList: "<li><strong>Smart Solar Lantern</strong> - 1 remaining</li><li><strong>Clean Cooking Stove</strong> - 0 remaining</li>",
    inventoryUrl: "#",
    email: "customer@domain.rw",
    unsubscribeUrl: "#"
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/projects/impressa/data/email_templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
        if (data.length > 0) {
          selectTemplate(data[0]);
        }
      } else {
        setMsg({ type: 'error', text: 'Failed to retrieve email templates.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Network failure loading email templates.' });
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (template) => {
    setActiveTemplate(template);
    setSubject(template.subject);
    setHtml(template.html);
  };

  const handleSave = async () => {
    if (!activeTemplate) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/projects/impressa/data/email_templates/${activeTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...activeTemplate,
          subject,
          html
        })
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Email template successfully updated!' });
        setTemplates(prev => prev.map(t => t.id === activeTemplate.id ? { ...t, subject, html } : t));
        setTimeout(() => setMsg(null), 3000);
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.error || 'Failed to save template.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Network error saving template changes.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail || !activeTemplate) return;
    setSendingTest(true);
    try {
      const res = await fetch(`${API_BASE_URL}/projects/impressa/email-templates/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          templateName: activeTemplate.name,
          recipientEmail: testEmail
        })
      });
      if (res.ok) {
        setMsg({ type: 'success', text: `Test email successfully sent to ${testEmail}!` });
        setTestEmail('');
        setTimeout(() => setMsg(null), 3500);
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.error || 'Failed to dispatch test email.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Network failure dispatching test email.' });
    } finally {
      setSendingTest(false);
    }
  };

  const insertPlaceholder = (ph) => {
    const textInput = document.getElementById("template-html-editor");
    if (!textInput) return;
    const startPos = textInput.selectionStart;
    const endPos = textInput.selectionEnd;
    const before = html.substring(0, startPos);
    const after = html.substring(endPos, html.length);
    const newHtml = before + `{{${ph}}}` + after;
    setHtml(newHtml);
    setTimeout(() => {
      textInput.focus();
      textInput.setSelectionRange(startPos + ph.length + 4, startPos + ph.length + 4);
    }, 0);
  };

  const getRenderedPreview = () => {
    let renderedHtml = html || '';
    Object.entries(mockVariables).forEach(([key, val]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      renderedHtml = renderedHtml.replace(regex, val);
      const tripleRegex = new RegExp(`{{{\\s*${key}\\s*}}}`, 'g');
      renderedHtml = renderedHtml.replace(tripleRegex, val);
    });
    return renderedHtml;
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-purple-550 animate-spin" />
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase animate-pulse">Syncing templates...</span>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="border border-dashed border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center p-12 space-y-3">
        <Mail className="w-12 h-12 text-slate-500" />
        <h4 className="text-sm font-bold text-slate-350">No Email Templates Found</h4>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">No email templates were found in the database. Ensure database seeds have run correctly.</p>
      </div>
    );
  }

  const placeholders = Object.keys(mockVariables);
  const previewHtml = getRenderedPreview();

  return (
    <div className="flex-grow flex flex-col lg:flex-row min-h-0 bg-slate-900/10 border border-slate-850 rounded-2xl overflow-hidden h-[calc(100vh-270px)]">
      {/* Left Templates List */}
      <div className="w-full lg:w-64 border-r border-slate-850 bg-slate-950/60 flex flex-col min-h-0 shrink-0">
        <div className="p-4 border-b border-slate-850 bg-slate-950/90 shrink-0">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Email Templates</h3>
          <p className="text-[10px] text-slate-555 mt-1 font-semibold">Select a template to customize.</p>
        </div>
        <div className="flex-grow overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
          {templates.map(t => {
            const isActive = activeTemplate?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => selectTemplate(t)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold'
                    : 'bg-transparent border-transparent hover:border-slate-800 hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className={`w-4.5 h-4.5 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                <span className="truncate capitalize">{t.name.replace(/_/g, ' ')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Workspace & Right Preview */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Center Editor */}
        <div className="flex-1 border-r border-slate-850 bg-slate-900/10 p-5 flex flex-col min-h-0 overflow-y-auto scrollbar-thin space-y-4">
          <div className="flex items-center justify-between shrink-0">
            <div>
              <h4 className="text-xs font-bold text-slate-250 uppercase tracking-wider">Template Editor</h4>
              <p className="text-[10px] text-slate-550 mt-0.5 font-medium">Use Handlebars templates. Placeholders are swapped dynamically.</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save Changes
            </button>
          </div>

          {/* Subject line input */}
          <div className="space-y-1.5 shrink-0">
            <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest">Email Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-purple-500 focus:bg-slate-955"
              placeholder="Enter subject line..."
            />
          </div>

          {/* HTML editor field */}
          <div className="space-y-1.5 flex-grow flex flex-col min-h-[250px]">
            <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest shrink-0">HTML Body</label>
            <textarea
              id="template-html-editor"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="w-full flex-grow p-3 bg-slate-955 border border-slate-850 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-purple-500 focus:bg-slate-955 resize-none overflow-y-auto"
              placeholder="Write HTML code here..."
            />
          </div>

          {/* Placeholder Insertion Box */}
          <div className="space-y-1.5 shrink-0 bg-slate-950/40 p-3.5 rounded-xl border border-slate-850/60">
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Click to Insert Variable Placeholder</span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
              {placeholders.map(ph => (
                <button
                  key={ph}
                  type="button"
                  onClick={() => insertPlaceholder(ph)}
                  className="px-2 py-1 bg-slate-900 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/40 text-[9px] font-mono font-bold text-purple-400 rounded-md transition-all cursor-pointer"
                >
                  {`{{${ph}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Send Test Email Section */}
          <div className="pt-4 border-t border-slate-850 shrink-0 space-y-2">
            <h5 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Send Test Email</h5>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter tester email address..."
                className="flex-1 px-3 py-2 bg-slate-955 border border-slate-850 rounded-lg text-slate-250 text-xs focus:outline-none focus:border-purple-500 focus:bg-slate-955"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={sendingTest || !testEmail.trim()}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send Test
              </button>
            </div>
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="w-full md:w-[360px] bg-slate-955/40 p-5 flex flex-col min-h-0 shrink-0 overflow-y-auto scrollbar-thin space-y-4">
          <div className="flex items-center justify-between shrink-0">
            <div>
              <h4 className="text-xs font-bold text-slate-250 uppercase tracking-wider">Live Preview</h4>
              <p className="text-[10px] text-slate-555 mt-0.5 font-medium">Real-time rendered mockup viewport.</p>
            </div>
            <div className="flex items-center border border-slate-850 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 transition-colors cursor-pointer ${previewMode === 'desktop' ? 'bg-purple-500/20 text-purple-400' : 'bg-transparent text-slate-500'}`}
                title="Desktop viewport"
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 transition-colors cursor-pointer ${previewMode === 'mobile' ? 'bg-purple-500/20 text-purple-400' : 'bg-transparent text-slate-500'}`}
                title="Mobile viewport"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-start min-h-[300px] overflow-hidden">
            <div
              className={`transition-all duration-300 ${
                previewMode === 'mobile'
                  ? 'w-[280px] h-[450px] border-[8px] border-slate-850 rounded-[32px] overflow-hidden shadow-2xl relative bg-white'
                  : 'w-full h-full border border-slate-850 rounded-xl overflow-hidden shadow-xl bg-white min-h-[400px]'
              }`}
            >
              <iframe
                srcDoc={previewHtml}
                title="Preview Frame"
                className="w-full h-full border-0 bg-white"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SellersVerificationWorkspace = ({ token, API_BASE_URL, setMsg }) => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSeller, setActiveSeller] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/projects/impressa/data/sellers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSellers(data);
        if (data.length > 0) {
          setActiveSeller(data[0]);
        }
      } else {
        setMsg({ type: 'error', text: 'Failed to retrieve registered sellers.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Network connection failure loading sellers.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySeller = async (sellerId, action, reason) => {
    if (processing) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/projects/impressa/sellers/${sellerId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, rejectionReason: reason })
      });
      if (res.ok) {
        setMsg({ type: 'success', text: `Seller application successfully ${action === 'approve' ? 'approved' : 'rejected'}!` });
        
        // Update state in list
        const updated = sellers.map(s => {
          if (s.id === sellerId) {
            const updatedRdb = s.rdbVerification ? {
              ...s.rdbVerification,
              documentStatus: action === 'approve' ? 'approved' : 'rejected',
              rejectionReason: action === 'reject' ? reason : undefined
            } : null;
            return {
              ...s,
              sellerStatus: action === 'approve' ? 'active' : 'rejected',
              rdbVerification: updatedRdb
            };
          }
          return s;
        });
        setSellers(updated);
        
        // Update active selection
        const match = updated.find(s => s.id === sellerId);
        setActiveSeller(match || null);
        
        setShowRejectForm(false);
        setRejectionReason('');
        setTimeout(() => setMsg(null), 3000);
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.error || 'Failed to update seller verification status.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to process request due to network instability.' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          <span className="text-slate-450 text-xs font-semibold tracking-wider uppercase animate-pulse">Syncing sellers...</span>
        </div>
      </div>
    );
  }

  // Filter sellers list
  const filteredSellers = sellers.filter(s => {
    const query = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query) ||
      s.storeName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-grow flex flex-col lg:flex-row min-h-0 bg-slate-900/10 border border-slate-850 rounded-2xl overflow-hidden h-[calc(100vh-270px)]">
      {/* Left Sellers List */}
      <div className="w-full lg:w-80 border-r border-slate-850 bg-slate-950/60 flex flex-col min-h-0 shrink-0">
        <div className="p-4 border-b border-slate-850 bg-slate-950/90 shrink-0 space-y-3">
          <div>
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Seller Verifications</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Review and verify RDB business credentials.</p>
          </div>
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-500" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by store or owner..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-[11px] text-slate-200 outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
          {filteredSellers.length === 0 ? (
            <div className="text-center py-8 text-[11px] text-slate-500 italic">No matching sellers found.</div>
          ) : (
            filteredSellers.map(s => {
              const isActive = activeSeller?.id === s.id;
              const status = s.sellerStatus?.toLowerCase();
              let badgeColor = 'bg-slate-900 text-slate-400 border-slate-800';
              if (status === 'active') badgeColor = 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30';
              if (status === 'pending') badgeColor = 'bg-amber-950/40 text-amber-400 border-amber-900/30';
              if (status === 'rejected') badgeColor = 'bg-red-950/40 text-red-400 border-red-900/30';

              return (
                <button
                  key={s.id}
                  onClick={() => { setActiveSeller(s); setShowRejectForm(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl border flex flex-col gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold'
                      : 'bg-transparent border-transparent hover:border-slate-800 hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-bold text-xs truncate max-w-[150px]">{s.storeName || 'Unnamed Store'}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${badgeColor}`}>
                      {status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center w-full text-[10px] text-slate-500">
                    <span className="truncate">{s.name}</span>
                    <span>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Details Panel */}
      <div className="flex-grow flex flex-col min-h-0 bg-slate-950/20">
        {!activeSeller ? (
          <div className="flex-grow flex flex-col items-center justify-center p-12 text-center space-y-3">
            <Building className="w-12 h-12 text-slate-650" />
            <h4 className="text-sm font-bold text-slate-350">No Seller Selected</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">Select a merchant profile from the left sidebar to audit their TIN registration and RDB business documents.</p>
          </div>
        ) : (
          <div className="flex-grow flex flex-col min-h-0 overflow-y-auto p-8 space-y-8 scrollbar-thin">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-900 shrink-0">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-400" />
                  {activeSeller.storeName || 'Unnamed Store'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Registered by <strong className="text-slate-300">{activeSeller.name}</strong> ({activeSeller.email})
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500">Ecosystem Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                  activeSeller.sellerStatus === 'active' ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' :
                  activeSeller.sellerStatus === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-red-500/10 text-red-450 border-red-500/20'
                }`}>
                  {activeSeller.sellerStatus}
                </span>
              </div>
            </div>

            {/* Document Review Body */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Left Column: Business details & terms */}
              <div className="space-y-6">
                
                {/* RDB Info Card */}
                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest border-b border-slate-850/60 pb-2">RDB Registration Details</h3>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">TIN Number</span>
                      <strong className="text-slate-200 text-sm font-mono tracking-wider">{activeSeller.rdbVerification?.tinNumber || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Business Type</span>
                      <span className="text-slate-300 font-semibold capitalize">{activeSeller.rdbVerification?.businessType?.replace('_', ' ') || 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registered Business Name</span>
                      <strong className="text-slate-200 font-bold">{activeSeller.rdbVerification?.businessName || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Audit Status</span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${
                        activeSeller.rdbVerification?.documentStatus === 'approved' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' :
                        activeSeller.rdbVerification?.documentStatus === 'rejected' ? 'bg-red-950/40 text-red-400 border-red-900/30' :
                        'bg-amber-950/40 text-amber-400 border-amber-900/30'
                      }`}>
                        {activeSeller.rdbVerification?.documentStatus || 'pending_review'}
                      </span>
                    </div>
                    {activeSeller.rdbVerification?.rejectionReason && (
                      <div className="col-span-2 p-3 bg-red-950/20 border border-red-900/30 rounded-xl">
                        <span className="block text-[9px] font-black text-red-400 uppercase tracking-wider mb-1">Rejection Reason</span>
                        <p className="text-[11px] text-red-300 font-semibold">{activeSeller.rdbVerification.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms Acceptance Card */}
                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest border-b border-slate-850/60 pb-2">Agreement Signature</h3>
                  
                  <div className="space-y-4 text-xs">
                    {activeSeller.termsAcceptance ? (
                      <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                        <div className="col-span-2">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Digital Signature</span>
                          <div className="px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-purple-400 italic font-serif text-lg tracking-wider">
                            {activeSeller.termsAcceptance.digitalSignature}
                          </div>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Signed Timestamp</span>
                          <span className="text-slate-300 font-medium">
                            {new Date(activeSeller.termsAcceptance.acceptedAt).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">IP Address</span>
                          <span className="text-slate-300 font-mono text-[11px]">{activeSeller.termsAcceptance.ipAddress || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contract Version</span>
                          <span className="text-slate-300 font-mono font-semibold">v{activeSeller.termsAcceptance.version}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 italic text-[11.5px]">No terms acceptance details available for this record.</div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Documents Previews */}
              <div className="space-y-6">
                
                {/* RDB Certificate File Preview */}
                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4 flex flex-col">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest border-b border-slate-850/60 pb-2">RDB Registration Certificate</h3>
                  
                  {activeSeller.rdbVerification?.rdbCertificate ? (
                    <div className="space-y-3 flex-grow flex flex-col">
                      <div className="border border-slate-800 rounded-xl bg-slate-950 p-2 overflow-hidden flex items-center justify-center min-h-[160px] max-h-[220px]">
                        {activeSeller.rdbVerification.rdbCertificate.endsWith('.pdf') ? (
                          <div className="text-center p-4 space-y-2">
                            <span className="text-2xl">📄</span>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">RDB Registration PDF File</span>
                          </div>
                        ) : (
                          <img 
                            src={activeSeller.rdbVerification.rdbCertificate} 
                            alt="RDB Certificate" 
                            className="max-w-full max-h-[200px] object-contain rounded-lg"
                          />
                        )}
                      </div>
                      <a
                        href={activeSeller.rdbVerification.rdbCertificate}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:border-purple-500 text-slate-300 hover:text-white rounded-xl text-[11px] font-bold text-center transition-all inline-block hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer"
                      >
                        Open RDB Document in New Tab ↗
                      </a>
                    </div>
                  ) : (
                    <div className="py-8 bg-slate-955/40 border border-dashed border-slate-850 rounded-xl text-center text-xs text-slate-500 italic">
                      No RDB Certificate uploaded.
                    </div>
                  )}
                </div>

                {/* National ID Preview */}
                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4 flex flex-col">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest border-b border-slate-850/60 pb-2">National ID / Passport</h3>
                  
                  {activeSeller.rdbVerification?.nationalId ? (
                    <div className="space-y-3 flex-grow flex flex-col">
                      <div className="border border-slate-800 rounded-xl bg-slate-950 p-2 overflow-hidden flex items-center justify-center min-h-[160px] max-h-[220px]">
                        {activeSeller.rdbVerification.nationalId.endsWith('.pdf') ? (
                          <div className="text-center p-4 space-y-2">
                            <span className="text-2xl">📄</span>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">National ID PDF Document</span>
                          </div>
                        ) : (
                          <img 
                            src={activeSeller.rdbVerification.nationalId} 
                            alt="National ID" 
                            className="max-w-full max-h-[200px] object-contain rounded-lg"
                          />
                        )}
                      </div>
                      <a
                        href={activeSeller.rdbVerification.nationalId}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:border-purple-500 text-slate-300 hover:text-white rounded-xl text-[11px] font-bold text-center transition-all inline-block hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer"
                      >
                        Open ID Document in New Tab ↗
                      </a>
                    </div>
                  ) : (
                    <div className="py-8 bg-slate-955/40 border border-dashed border-slate-850 rounded-xl text-center text-xs text-slate-500 italic">
                      No National ID or Passport document uploaded.
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Verification Processing Actions */}
            {activeSeller.sellerStatus === 'pending' ? (
              <div className="border-t border-slate-900 pt-8 space-y-4 shrink-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">KYC Auditing Checklist</h4>
                    <p className="text-[10px] text-slate-500">Approve the merchant store or reject their application with a feedback explanation.</p>
                  </div>
                  
                  {!showRejectForm && (
                    <div className="flex items-center gap-3">
                      <button
                        disabled={processing}
                        onClick={() => setShowRejectForm(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject Application
                      </button>
                      <button
                        disabled={processing}
                        onClick={() => handleVerifySeller(activeSeller.id, 'approve')}
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer"
                      >
                        {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Approve Seller
                      </button>
                    </div>
                  )}
                </div>

                {showRejectForm && (
                  <div className="bg-slate-900/60 border border-red-500/20 rounded-2xl p-5 space-y-4 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-red-400 uppercase tracking-widest">Rejection Reason *</label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide details about why the registration was rejected (e.g. Incomplete RDB details, unclear ID photo). This will be emailed directly to the seller."
                        className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-red-500 resize-none h-20"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => { setShowRejectForm(false); setRejectionReason(''); }}
                        className="px-3.5 py-2 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={processing || !rejectionReason.trim()}
                        onClick={() => handleVerifySeller(activeSeller.id, 'reject', rejectionReason)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg cursor-pointer"
                      >
                        {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Rejection'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-t border-slate-900 pt-8 shrink-0 flex justify-between items-center text-xs text-slate-500">
                <span>Application processed. Status is locked.</span>
                <span className="font-semibold uppercase tracking-wider text-[10px]">Ubaka Ecosystem verification registry</span>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
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
  const [deleteConfirm, setDeleteConfirm] = useState(null); // record id | null
  const [isDeletePending, setIsDeletePending] = useState(false);

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

  // Generic CRUD Delete — trigger custom modal
  const handleGenericDelete = (id) => {
    setDeleteConfirm(id);
  };

  const executeGenericDelete = async () => {
    if (!deleteConfirm || isDeletePending) return;
    setIsDeletePending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/impressa/data/${selectedFeature}/${deleteConfirm}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setDeleteConfirm(null);
        setMsg({ type: 'success', text: 'Record successfully deleted!' });
        setGenericData(prev => prev.filter(item => item.id !== deleteConfirm));
        setTimeout(() => setMsg(null), 3000);
      } else {
        const err = await response.json();
        setDeleteConfirm(null);
        setMsg({ type: 'error', text: err.error || 'Failed to delete record.' });
      }
    } catch (err) {
      setDeleteConfirm(null);
      setMsg({ type: 'error', text: 'Failed to process delete request.' });
    } finally {
      setIsDeletePending(false);
    }
  };

  // Generic CRUD Submit (Create or Update)
  const handleGenericSubmit = async (e) => {
    e.preventDefault();
    const method = modalMode === 'create' ? 'POST' : 'PUT';
    const url = modalMode === 'create' 
      ? `${API_BASE_URL}/projects/impressa/data/${selectedFeature}`
      : `${API_BASE_URL}/projects/impressa/data/${selectedFeature}/${editRecordId}`;

    let submitData = { ...formData };
    try {
      const jsonFields = ['socialLinks', 'trustBadges', 'regions', 'methods', 'categoryRates', 'sellerRates'];
      for (const field of jsonFields) {
        if (submitData[field] && typeof submitData[field] === 'string') {
          submitData[field] = JSON.parse(submitData[field]);
        }
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Invalid JSON format in settings fields. Please verify JSON syntax.' });
      return;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
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
      if (selectedFeature === 'delivery' && (f.name === 'regions' || f.name === 'methods')) {
        initialForm[f.name] = [];
      } else if (f.name === 'socialLinks') {
        initialForm[f.name] = { facebook: '', twitter: '', instagram: '', linkedin: '' };
      } else if (f.name === 'trustBadges') {
        initialForm[f.name] = [];
      } else {
        initialForm[f.name] = f.type === 'checkbox' ? false : '';
      }
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
      let val = record[f.name];
      if (selectedFeature === 'delivery' && (f.name === 'regions' || f.name === 'methods')) {
        if (typeof val === 'string') {
          try {
            val = JSON.parse(val);
          } catch (e) {
            val = [];
          }
        }
        formVals[f.name] = Array.isArray(val) ? val : [];
      } else if (f.name === 'socialLinks' || f.name === 'trustBadges') {
        if (typeof val === 'string' && val.trim() !== '') {
          try {
            val = JSON.parse(val);
          } catch (e) {
            val = null;
          }
        }
        if (f.name === 'socialLinks') {
          formVals[f.name] = val || { facebook: '', twitter: '', instagram: '', linkedin: '' };
        } else if (f.name === 'trustBadges') {
          formVals[f.name] = Array.isArray(val) ? val : [];
        }
      } else {
        if (val !== undefined && typeof val === 'object' && val !== null) {
          val = JSON.stringify(val, null, 2);
        }
        formVals[f.name] = val !== undefined ? val : '';
      }
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
          ) : selectedFeature === 'email_templates' ? (
            /* Custom View: Email Templates Workspace */
            <EmailTemplatesWorkspace token={token} API_BASE_URL={API_BASE_URL} setMsg={setMsg} />
          ) : selectedFeature === 'sellers' ? (
            /* Custom View: Seller Verification Review Workspace */
            <SellersVerificationWorkspace token={token} API_BASE_URL={API_BASE_URL} setMsg={setMsg} />
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
                          {Object.keys(filteredData[0]).filter(key => {
                            if (key === 'id') return false;
                            const schemaKeys = (FORM_SCHEMAS[selectedFeature] || []).map(f => f.name);
                            if (schemaKeys.length > 0) {
                              return schemaKeys.includes(key) || key === 'createdAt' || key === 'updatedAt';
                            }
                            return true;
                          }).map(key => (
                            <th key={key} className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{key}</th>
                          ))}
                          <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/50">
                        {filteredData.map((record) => (
                          <tr key={record.id} className="hover:bg-slate-900/30 transition-colors">
                            {Object.entries(record).filter(([key]) => {
                              if (key === 'id') return false;
                              const schemaKeys = (FORM_SCHEMAS[selectedFeature] || []).map(f => f.name);
                              if (schemaKeys.length > 0) {
                                return schemaKeys.includes(key) || key === 'createdAt' || key === 'updatedAt';
                              }
                              return true;
                            }).map(([key, val]) => (
                              <td key={key} className="px-5 py-3 text-xs text-slate-300 font-medium whitespace-nowrap max-w-xs truncate">
                                {renderCellContent(key, val)}
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

      {/* 2b. Custom Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white">Delete Record?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This record will be permanently removed from the <span className="text-slate-200 font-semibold">{activeTabConfig?.label}</span> database. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeletePending}
                className="flex-1 py-2.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeGenericDelete}
                disabled={isDeletePending}
                className="flex-1 py-2.5 inline-flex items-center justify-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-bold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-60 active:scale-95"
              >
                {isDeletePending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                {isDeletePending ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
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
              {selectedFeature === 'delivery' ? (
                <DeliveryFormEditor formData={formData} setFormData={setFormData} />
              ) : (
                (FORM_SCHEMAS[selectedFeature] || []).map((field) => (
                  <div key={field.name} className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {field.name === 'socialLinks' ? (
                      <SocialLinksEditor
                        value={formData[field.name]}
                        onChange={(val) => setFormData({ ...formData, [field.name]: val })}
                      />
                    ) : field.name === 'trustBadges' ? (
                      <TrustBadgesEditor
                        value={formData[field.name]}
                        onChange={(val) => setFormData({ ...formData, [field.name]: val })}
                      />
                    ) : field.type === 'select' ? (
                      <select
                         value={formData[field.name] || ''}
                         onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                         required={field.required}
                         className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-purple-550 focus:bg-slate-950 transition-colors"
                      >
                        <option value="" className="text-slate-500">-- Select {field.label} --</option>
                        {field.options.map(opt => (
                          <option key={opt} value={opt} className="bg-slate-955 text-slate-200">{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        required={field.required}
                        placeholder={`Enter ${field.label}...`}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-purple-550 focus:bg-slate-950 transition-colors resize-none h-24"
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
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-purple-550 focus:bg-slate-950 transition-colors"
                      />
                    )}
                  </div>
                ))
              )}

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


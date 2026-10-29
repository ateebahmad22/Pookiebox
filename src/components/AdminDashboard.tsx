import React, { useState, useEffect } from 'react';
import { Product, Order, EmailLog, BirthdayEntry, OrderStatus, GiftLink, ReferralProfile } from '../types.ts';
import { BowIcon } from './BowIcon.tsx';
import {
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Mail,
  Plus,
  Trash2,
  Edit2,
  Search,
  Eye,
  RefreshCw,
  Bell,
  ShieldAlert,
  Share2,
  EyeOff,
  Users,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'emails' | 'birthdays' | 'gift_links' | 'referrals'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [birthdays, setBirthdays] = useState<BirthdayEntry[]>([]);
  const [giftLinks, setGiftLinks] = useState<GiftLink[]>([]);
  const [referrals, setReferrals] = useState<ReferralProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status Update Modal
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('processing');
  const [statusNote, setStatusNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courier, setCourier] = useState('BlueDart Express');

  // Email Preview Modal
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);

  // New Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'Teddy Bears & Plushies',
    categorySlug: 'plushies',
    price: 499,
    description: '',
    image: '/src/assets/images/product_fluffy_teddy_1793289142027.jpg',
    modelShape: 'teddy' as const,
    tags: 'Cute, Gift',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ovRes, ordRes, prodRes, emlRes, bdayRes, glRes, refRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/orders'),
        fetch('/api/products'),
        fetch('/api/admin/email-logs'),
        fetch('/api/birthdays'),
        fetch('/api/admin/gift-links'),
        fetch('/api/admin/referrals'),
      ]);

      if (ovRes.ok) setStats(await ovRes.json());
      if (ordRes.ok) setOrders((await ordRes.json()).orders || []);
      if (prodRes.ok) setProducts((await prodRes.json()).products || []);
      if (emlRes.ok) setEmailLogs((await emlRes.json()).emails || []);
      if (bdayRes.ok) setBirthdays((await bdayRes.json()).birthdays || []);
      if (glRes.ok) setGiftLinks((await glRes.json()).giftLinks || []);
      if (refRes.ok) setReferrals((await refRes.json()).referrals || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForStatus) return;

    try {
      const res = await fetch(`/api/orders/${selectedOrderForStatus.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote || `Status updated to ${newStatus}`,
          trackingNumber: trackingNumber || undefined,
          courier: trackingNumber ? courier : undefined,
        }),
      });

      if (res.ok) {
        setSelectedOrderForStatus(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProductForm,
          price: Number(newProductForm.price),
          tags: newProductForm.tags.split(',').map((t) => t.trim()),
          featured: true,
        }),
      });
      if (res.ok) {
        setShowAddProductModal(false);
        fetchData();
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F8BBD0]/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#59434D] flex items-center gap-2">
              <span>PookieBox Atelier Dashboard</span>
              <BowIcon className="w-5 h-5 text-[#C45A7A]" />
            </h1>
            <span className="text-xs font-bold text-[#C45A7A] bg-[#FFF0F5] px-2.5 py-0.5 rounded-full border border-[#F8BBD0]">
              Admin Role Active
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time orders, payment tracking, live dispatch controls, digital unboxing links, and referrals.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#59434D] bg-white border border-gray-200 hover:border-[#C45A7A] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#F8BBD0]/30 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & KPIs' },
          { id: 'orders', label: `Orders (${orders.length})` },
          { id: 'products', label: `Products (${products.length})` },
          { id: 'gift_links', label: `Gift Links (${giftLinks.length})` },
          { id: 'referrals', label: `Referral Program (${referrals.length})` },
          { id: 'emails', label: `Email Logs (${emailLogs.length})` },
          { id: 'birthdays', label: `Birthday Reminders (${birthdays.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#C45A7A] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:text-[#C45A7A] border border-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#F8BBD0]/40 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Total Revenue</span>
              <div className="text-2xl font-bold font-serif text-[#C45A7A] tabular-nums">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-600">From completed payments</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#F8BBD0]/40 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Total Orders</span>
              <div className="text-2xl font-bold font-serif text-[#59434D] tabular-nums">
                {stats.totalOrders}
              </div>
              <span className="text-[10px] text-gray-400">All customer checkouts</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#F8BBD0]/40 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Confirmed Orders</span>
              <div className="text-2xl font-bold font-serif text-emerald-600 tabular-nums">
                {stats.confirmedOrders}
              </div>
              <span className="text-[10px] text-gray-400">Ready for packaging</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#F8BBD0]/40 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Pending Payments</span>
              <div className="text-2xl font-bold font-serif text-amber-600 tabular-nums">
                {stats.pendingOrders}
              </div>
              <span className="text-[10px] text-gray-400">Awaiting user completion</span>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-3xl p-6 border border-[#F8BBD0]/40 shadow-xs space-y-4">
            <h3 className="text-base font-semibold text-[#59434D]">Recent Orders</h3>
            <div className="space-y-3">
              {orders.slice(0, 5).map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-[#59434D]">{ord.orderNumber}</span>
                    <span className="text-gray-500 ml-2">by {ord.customer.fullName}</span>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {ord.items.length} items • ₹{ord.total} • {new Date(ord.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-pink-50 text-[#C45A7A] border border-[#F8BBD0]">
                      {ord.status}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedOrderForStatus(ord);
                        setNewStatus(ord.status);
                      }}
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#FFF0F5] text-[#C45A7A] hover:bg-[#F8BBD0]/40 transition-colors cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#59434D]">Customer Orders Lifecycle</h3>
            <span className="text-xs text-gray-500">Live order processing</span>
          </div>

          <div className="bg-white rounded-3xl border border-[#F8BBD0]/40 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF9F5] border-b border-[#F8BBD0]/30 text-[#C45A7A] font-semibold">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Total</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-pink-50/30">
                      <td className="p-4 font-mono font-bold text-[#59434D]">{ord.orderNumber}</td>
                      <td className="p-4">
                        <div className="font-semibold text-[#59434D]">{ord.customer.fullName}</div>
                        <div className="text-[11px] text-gray-400">{ord.customer.email}</div>
                      </td>
                      <td className="p-4 text-gray-500">{new Date(ord.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.payment.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.payment.status}
                          {ord.payment.isTestMode ? ' (Test)' : ''}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-pink-100 text-[#C45A7A]">
                          {ord.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-[#C45A7A] tabular-nums font-serif">
                        ₹{ord.total.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrderForStatus(ord);
                            setNewStatus(ord.status);
                            setTrackingNumber(ord.tracking?.trackingNumber || '');
                          }}
                          className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#C45A7A] text-white hover:bg-[#b04867] transition-all cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Products */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#59434D]">Catalog Products</h3>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="py-2 px-4 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-[#F8BBD0]/40 p-4 space-y-3 shadow-xs">
                <div className="flex gap-3 items-center">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-16 h-16 object-cover rounded-xl border border-gray-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-[#59434D] truncate">{p.name}</h4>
                    <span className="text-[11px] text-gray-500">{p.category}</span>
                    <div className="text-xs font-bold text-[#C45A7A] mt-0.5 tabular-nums">₹{p.price}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <span className="text-[11px] text-emerald-600 font-semibold">✓ In Stock</span>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="text-red-500 hover:text-red-700 text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Email Logs */}
      {activeTab === 'emails' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#59434D]">Transactional Email Logs</h3>
              <p className="text-xs text-gray-500">
                Automated order confirmation, payment receipt, and reminder emails dispatched by PookieBox.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {emailLogs.length} Dispatched
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-[#F8BBD0]/40 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF9F5] border-b border-[#F8BBD0]/30 text-[#C45A7A] font-semibold">
                  <tr>
                    <th className="p-4">Recipient</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Sent At</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {emailLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-pink-50/20">
                      <td className="p-4 font-medium text-[#59434D]">{log.recipient}</td>
                      <td className="p-4 font-semibold text-[#C45A7A]">{log.subject}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                          {log.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">{new Date(log.sentAt).toLocaleString()}</td>
                      <td className="p-4">
                        <span className="text-emerald-600 font-semibold text-[11px]">✓ Delivered</span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedEmail(log)}
                          className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#FFF0F5] text-[#C45A7A] hover:bg-[#F8BBD0]/40 cursor-pointer"
                        >
                          Preview HTML
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Birthday Reminders Queue */}
      {activeTab === 'birthdays' && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-[#59434D]">Tracked Loved Ones Birthdays</h3>
          <div className="bg-white rounded-3xl border border-[#F8BBD0]/40 p-5 space-y-3">
            {birthdays.map((b) => (
              <div key={b.id} className="p-3.5 rounded-2xl border border-gray-100 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-semibold text-[#59434D]">{b.recipientName} ({b.relationship})</h4>
                  <p className="text-gray-400">Date: {b.date} • Budget: ₹{b.budget}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#C45A7A] font-semibold">Active Background Job</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Digital Gift Links */}
      {activeTab === 'gift_links' && (
        <div className="bg-white rounded-3xl p-6 border border-[#F8BBD0]/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F8BBD0]/30 pb-4">
            <div>
              <h3 className="text-base font-semibold text-[#59434D]">Digital Unboxing & Gift Links ({giftLinks.length})</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage 3D gift unboxing tokens, access permissions, and revoke compromised links.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {giftLinks.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">No gift links generated yet.</div>
            ) : (
              giftLinks.map((link) => (
                <div key={link.id} className="p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#C45A7A]">{link.token}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        link.isRevoked ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {link.isRevoked ? 'Revoked' : 'Active'}
                      </span>
                      {link.openedAt && (
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-medium">
                          Opened
                        </span>
                      )}
                    </div>
                    <p className="text-[#59434D] mt-1">
                      From: <strong>{link.senderName}</strong> → To: <strong>{link.recipientName}</strong>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 italic">"{link.message}"</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!link.isRevoked && (
                      <button
                        onClick={async () => {
                          await fetch(`/api/gift-links/${link.id}/revoke`, { method: 'POST' });
                          fetchData();
                        }}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                      >
                        Revoke Access
                      </button>
                    )}
                    <a
                      href={`?giftToken=${link.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#FFF0F5] text-[#C45A7A] border border-[#F8BBD0] text-xs font-semibold hover:bg-[#F8BBD0]/30 cursor-pointer"
                    >
                      Preview Reveal
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: Referral Program */}
      {activeTab === 'referrals' && (
        <div className="bg-white rounded-3xl p-6 border border-[#F8BBD0]/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F8BBD0]/30 pb-4">
            <div>
              <h3 className="text-base font-semibold text-[#59434D]">Referral Rewards Program ({referrals.length})</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Active customer referral codes, reward ledgers, and credit redemption rates.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {referrals.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">No active referral profiles yet.</div>
            ) : (
              referrals.map((ref) => (
                <div key={ref.userId} className="p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#59434D] text-sm">{ref.code}</span>
                      <span className="text-gray-400">User: {ref.userId}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                      <span>Total Invited: <strong>{ref.totalInvited}</strong></span>
                      <span>Credits Earned: <strong className="text-emerald-600">₹{ref.creditsEarned}</strong></span>
                      <span>Credits Available: <strong className="text-[#C45A7A]">₹{ref.creditsAvailable}</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-gray-400 block">{ref.history?.length || 0} Successful Conversions</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Order Status Update Modal */}
      {selectedOrderForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#F8BBD0]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-semibold text-[#59434D]">
                Update Order {selectedOrderForStatus.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrderForStatus(null)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateOrderStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A] bg-white font-medium"
                >
                  <option value="pending_payment">Pending Payment</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing (Wrapping Box)</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {(newStatus === 'shipped' || newStatus === 'delivered') && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#59434D] mb-1">Courier Partner</label>
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                    >
                      <option value="BlueDart Express">BlueDart Express</option>
                      <option value="Delhivery Surface">Delhivery Surface</option>
                      <option value="DTDC Premium">DTDC Premium</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#59434D] mb-1">Tracking Number</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. BLUEDART-PB-998811"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-1">Status Note (Sent in Email)</label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Beautifully hand-tied with pink satin ribbon and dispatched via priority courier."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForStatus(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] cursor-pointer"
                >
                  Save & Trigger Customer Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-[#F8BBD0]">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Transactional Email Preview</span>
                <h3 className="text-base font-bold text-[#59434D]">{selectedEmail.subject}</h3>
                <p className="text-xs text-gray-500">To: {selectedEmail.recipient}</p>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div
              className="p-4 bg-gray-50 rounded-2xl border border-gray-200 overflow-x-auto text-xs"
              dangerouslySetInnerHTML={{ __html: selectedEmail.htmlPreview }}
            />
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#F8BBD0]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-semibold text-[#59434D]">Add New Boutique Gift</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  placeholder="e.g. Dainty Pearl Ribbon Bow"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#59434D] mb-1">Category</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="Teddy Bears & Plushies">Plushies</option>
                    <option value="Chocolates & Treats">Chocolates</option>
                    <option value="Jewellery & Accessories">Jewellery</option>
                    <option value="Flowers & Bouquets">Flowers</option>
                    <option value="Cute Stationery">Stationery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#59434D] mb-1">Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  placeholder="Product description and sizing..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] cursor-pointer"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

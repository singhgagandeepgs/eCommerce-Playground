import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports']
const STATUS_OPTIONS = ['pending', 'shipped', 'delivered', 'cancelled']
const STATUS_STYLES = {
  pending:   'bg-amber-50 text-amber-700 border-amber-100',
  shipped:   'bg-blue-50 text-blue-700 border-blue-100',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled: 'bg-red-50 text-red-600 border-red-100',
}
const EMPTY_FORM = {
  name: '', description: '', price: '', category: 'Electronics',
  stock_quantity: '', image_url: '',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
function shortId(id) { return id.slice(0, 8).toUpperCase() }

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] ?? 'bg-gray-50 text-gray-600 border-gray-100'
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${cls}`}>
      {status}
    </span>
  )
}

function ProductModal({ product, onClose, onSaved }) {
  const isEdit = Boolean(product)
  const [form, setForm] = useState(
    isEdit
      ? { name: product.name, description: product.description ?? '', price: product.price, category: product.category ?? 'Electronics', stock_quantity: product.stock_quantity, image_url: product.image_url ?? '' }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      category: form.category,
      stock_quantity: parseInt(form.stock_quantity, 10),
      image_url: form.image_url.trim() || null,
    }

    const { error: dbError } = isEdit
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert(payload)

    setSaving(false)
    if (dbError) { setError(dbError.message); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="product-modal">
      <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-base font-bold text-[#0F172A]" data-testid="product-modal-title">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="product-modal-close"
          >
            <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" data-testid="product-form">
          {error && (
            <div className="bg-red-50 border border-red-100 text-[#EF4444] rounded-xl px-4 py-3 text-sm" data-testid="product-form-error">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">Name *</label>
            <input type="text" required value={form.name} onChange={e => set('name', e.target.value)} className="input-field" data-testid="product-form-name" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">Price *</label>
              <input type="number" required min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} className="input-field" data-testid="product-form-price" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">Stock *</label>
              <input type="number" required min="0" step="1" value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)} className="input-field" data-testid="product-form-stock" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field" data-testid="product-form-category">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">Image URL</label>
            <input type="url" value={form.image_url} placeholder="https://…" onChange={e => set('image_url', e.target.value)} className="input-field" data-testid="product-form-image-url" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} className="input-field resize-none" data-testid="product-form-description" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-[#E2E8F0] text-[#64748B] py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors" data-testid="product-form-cancel">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-gradient text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60" data-testid="product-form-submit">
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ productName, onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="delete-modal">
      <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-scale-in">
        <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-[#0F172A] mb-1" data-testid="delete-modal-title">Delete product?</h3>
        <p className="text-sm text-[#64748B] mb-6">
          <strong className="text-[#0F172A]">{productName}</strong> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-[#E2E8F0] text-[#64748B] py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors" data-testid="delete-cancel">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting} className="flex-1 bg-[#EF4444] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60" data-testid="delete-confirm">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [accessChecked, setAccessChecked] = useState(false)
  const [activeTab, setActiveTab] = useState('products')

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [modalProduct, setModalProduct] = useState(undefined)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user || profile === null) {
      if (!authLoading && profile === null && user) navigate('/')
      else if (!user) navigate('/')
      return
    }
    if (profile.role !== 'admin') { navigate('/'); return }
    setAccessChecked(true)
  }, [user, profile, authLoading, navigate])

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data ?? [])
    setProductsLoading(false)
  }, [])

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false })

    if (!ordersData?.length) { setOrders([]); setOrdersLoading(false); return }

    const userIds = [...new Set(ordersData.map(o => o.user_id))]
    const { data: profilesData } = await supabase.from('profiles').select('id, email').in('id', userIds)

    const byId = Object.fromEntries((profilesData ?? []).map(p => [p.id, p]))
    setOrders(ordersData.map(o => ({ ...o, user_email: byId[o.user_id]?.email ?? `${o.user_id.slice(0, 8)}…` })))
    setOrdersLoading(false)
  }, [])

  useEffect(() => {
    if (!accessChecked) return
    fetchProducts()
    fetchOrders()
  }, [accessChecked, fetchProducts, fetchOrders])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('products').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    addToast('Product deleted')
    fetchProducts()
  }

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId)
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      addToast('Order status updated')
    }
    setUpdatingOrderId(null)
  }

  if (authLoading || !accessChecked) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] animate-pulse">
        <div className="w-56 bg-[#0F172A]" />
        <div className="flex-1 p-8 space-y-4">
          <div className="h-8 bg-gray-100 rounded-xl w-1/4" />
          <div className="h-64 bg-white rounded-2xl border border-[#E2E8F0]" />
        </div>
      </div>
    )
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0)

  return (
    <div className="flex min-h-[calc(100vh-64px)]" data-testid="admin-page">

      {/* Dark sidebar */}
      <aside className="w-56 bg-[#0F172A] flex-shrink-0 flex flex-col">
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col p-5">
          <div className="mb-6">
            <p className="text-[10px] font-semibold text-[#475569] uppercase tracking-widest mb-3">Navigation</p>
            <nav className="space-y-1" data-testid="admin-tabs">
              {[
                {
                  id: 'products',
                  label: 'Products',
                  count: products.length,
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  ),
                },
                {
                  id: 'orders',
                  label: 'Orders',
                  count: orders.length,
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  ),
                },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                  data-testid={`admin-tab-${tab.id}`}
                >
                  <span className={activeTab === tab.id ? 'text-[#6366F1]' : ''}>{tab.icon}</span>
                  <span className="flex-1 text-left">{tab.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
                    activeTab === tab.id ? 'bg-[#6366F1]/20 text-[#818CF8]' : 'bg-white/5 text-[#64748B]'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-[#FAFAFA] min-w-0 overflow-y-auto">
        <div className="p-6 lg:p-8">

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Products', value: products.length, icon: '📦', color: 'from-indigo-50 to-purple-50', border: 'border-indigo-100' },
              { label: 'Total Orders',   value: orders.length,   icon: '📋', color: 'from-blue-50 to-cyan-50',   border: 'border-blue-100' },
              { label: 'Total Revenue',  value: `$${totalRevenue.toFixed(2)}`, icon: '💰', color: 'from-emerald-50 to-teal-50', border: 'border-emerald-100' },
            ].map(stat => (
              <div
                key={stat.label}
                className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-5`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">{stat.label}</p>
                  <span className="text-lg">{stat.icon}</span>
                </div>
                <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Products tab */}
          {activeTab === 'products' && (
            <div data-testid="admin-products-tab">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-[#0F172A]">All Products</h2>
                <button
                  onClick={() => setModalProduct(null)}
                  className="btn-gradient text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                  data-testid="add-product-btn"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </button>
              </div>

              {productsLoading ? (
                <div className="space-y-2 animate-pulse">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-white rounded-xl border border-[#E2E8F0]" />)}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden" data-testid="admin-products-table">
                  {products.length === 0 ? (
                    <div className="text-center py-16 text-[#94A3B8]" data-testid="admin-products-empty">
                      <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-[#64748B]">No products yet.</p>
                      <button onClick={() => setModalProduct(null)} className="text-[#6366F1] hover:text-[#4F46E5] text-sm font-medium mt-2 transition-colors">
                        Add your first product →
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#E2E8F0]">
                            <th className="px-5 py-3.5 w-10" />
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">Name</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide hidden sm:table-cell">Category</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">Price</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide hidden md:table-cell">Stock</th>
                            <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                          {products.map(product => (
                            <tr key={product.id} className="hover:bg-[#FAFAFA] transition-colors" data-testid={`admin-product-row-${product.id}`}>
                              <td className="px-5 py-3.5">
                                <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0]">
                                  <img src={product.image_url || `https://picsum.photos/seed/${product.id}/36/36`} alt="" className="w-full h-full object-cover" />
                                </div>
                              </td>
                              <td className="px-5 py-3.5 font-semibold text-[#0F172A] max-w-[180px] truncate" data-testid={`admin-product-name-${product.id}`}>
                                {product.name}
                              </td>
                              <td className="px-5 py-3.5 text-[#64748B] hidden sm:table-cell" data-testid={`admin-product-category-${product.id}`}>
                                {product.category}
                              </td>
                              <td className="px-5 py-3.5 font-mono font-semibold text-[#0F172A]" data-testid={`admin-product-price-${product.id}`}>
                                ${Number(product.price).toFixed(2)}
                              </td>
                              <td className="px-5 py-3.5 hidden md:table-cell" data-testid={`admin-product-stock-${product.id}`}>
                                <span className={`text-sm font-bold ${
                                  product.stock_quantity === 0 ? 'text-[#EF4444]'
                                  : product.stock_quantity < 5 ? 'text-amber-600'
                                  : 'text-[#0F172A]'
                                }`}>
                                  {product.stock_quantity}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setModalProduct(product)}
                                    className="text-xs px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#6366F1]/50 hover:text-[#6366F1] transition-all"
                                    data-testid={`edit-product-${product.id}`}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                                    className="text-xs px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-red-200 hover:text-[#EF4444] transition-all"
                                    data-testid={`delete-product-${product.id}`}
                                  >
                                    Delete
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
              )}
            </div>
          )}

          {/* Orders tab */}
          {activeTab === 'orders' && (
            <div data-testid="admin-orders-tab">
              <h2 className="text-base font-bold text-[#0F172A] mb-5">All Orders</h2>

              {ordersLoading ? (
                <div className="space-y-2 animate-pulse">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-white rounded-xl border border-[#E2E8F0]" />)}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden" data-testid="admin-orders-table">
                  {orders.length === 0 ? (
                    <div className="text-center py-16" data-testid="admin-orders-empty">
                      <p className="text-sm text-[#94A3B8]">No orders yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#E2E8F0]">
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">Order ID</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide hidden md:table-cell">Customer</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide hidden sm:table-cell">Date</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">Status</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                          {orders.map(order => (
                            <tr key={order.id} className="hover:bg-[#FAFAFA] transition-colors" data-testid={`admin-order-row-${order.id}`}>
                              <td className="px-5 py-3.5 font-mono font-bold text-[#0F172A]" data-testid={`admin-order-id-${order.id}`}>
                                #{shortId(order.id)}
                              </td>
                              <td className="px-5 py-3.5 text-[#64748B] hidden md:table-cell" data-testid={`admin-order-email-${order.id}`}>
                                <span className="truncate block max-w-[180px]">{order.user_email}</span>
                              </td>
                              <td className="px-5 py-3.5 text-[#64748B] hidden sm:table-cell" data-testid={`admin-order-date-${order.id}`}>
                                {formatDate(order.created_at)}
                              </td>
                              <td className="px-5 py-3.5" data-testid={`admin-order-status-cell-${order.id}`}>
                                <div className="relative inline-block">
                                  <select
                                    value={order.status}
                                    onChange={e => handleStatusChange(order.id, e.target.value)}
                                    disabled={updatingOrderId === order.id}
                                    className={`appearance-none text-xs font-semibold rounded-full pl-3 pr-7 py-1.5 border cursor-pointer disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 ${
                                      STATUS_STYLES[order.status] ?? 'bg-gray-50 text-gray-600 border-gray-100'
                                    }`}
                                    data-testid={`admin-order-status-select-${order.id}`}
                                  >
                                    {STATUS_OPTIONS.map(s => (
                                      <option key={s} value={s} className="bg-white text-gray-900 font-normal">
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                      </option>
                                    ))}
                                  </select>
                                  <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 font-mono font-bold text-[#0F172A]" data-testid={`admin-order-total-${order.id}`}>
                                ${Number(order.total_amount).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {modalProduct !== undefined && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSaved={() => {
            setModalProduct(undefined)
            addToast(modalProduct ? 'Product updated' : 'Product added')
            fetchProducts()
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          productName={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  )
}

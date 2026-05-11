import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// ── constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports']
const STATUS_OPTIONS = ['pending', 'shipped', 'delivered', 'cancelled']
const STATUS_STYLES = {
  pending:   'bg-amber-100 text-amber-700',
  shipped:   'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}
const EMPTY_FORM = {
  name: '', description: '', price: '', category: 'Electronics',
  stock_quantity: '', image_url: '',
}

// ── shared helpers ────────────────────────────────────────────────────────────
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
function shortId(id) { return id.slice(0, 8).toUpperCase() }

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${cls}`}>
      {status}
    </span>
  )
}

// ── ProductModal ──────────────────────────────────────────────────────────────
function ProductModal({ product, onClose, onSaved }) {
  const isEdit = Boolean(product)
  const [form, setForm] = useState(
    isEdit
      ? {
          name: product.name,
          description: product.description ?? '',
          price: product.price,
          category: product.category ?? 'Electronics',
          stock_quantity: product.stock_quantity,
          image_url: product.image_url ?? '',
        }
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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900" data-testid="product-modal-title">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="product-modal-close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" data-testid="product-form">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm" data-testid="product-form-error">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
            <input
              type="text" required value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              data-testid="product-form-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price *</label>
              <input
                type="number" required min="0" step="0.01" value={form.price}
                onChange={e => set('price', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                data-testid="product-form-price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock *</label>
              <input
                type="number" required min="0" step="1" value={form.stock_quantity}
                onChange={e => set('stock_quantity', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                data-testid="product-form-stock"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              data-testid="product-form-category"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
            <input
              type="url" value={form.image_url} placeholder="https://…"
              onChange={e => set('image_url', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              data-testid="product-form-image-url"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              rows={3} value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              data-testid="product-form-description"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              data-testid="product-form-cancel"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
              data-testid="product-form-submit"
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── DeleteConfirmModal ────────────────────────────────────────────────────────
function DeleteConfirmModal({ productName, onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="delete-modal">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1" data-testid="delete-modal-title">
          Delete product?
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          <strong className="text-gray-700">{productName}</strong> will be permanently removed.
          This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            data-testid="delete-cancel"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm} disabled={deleting}
            className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
            data-testid="delete-confirm"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── AdminPage ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [accessChecked, setAccessChecked] = useState(false)
  const [activeTab, setActiveTab] = useState('products')

  // products
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  // undefined = modal closed  |  null = add mode  |  object = edit mode
  const [modalProduct, setModalProduct] = useState(undefined)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // orders
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  // ── guard: redirect non-admins ───────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (!user || profile === null) {
      // profile null means it finished loading and is definitely not admin
      if (!authLoading && profile === null && user) {
        navigate('/')
      } else if (!user) {
        navigate('/')
      }
      return
    }
    if (profile.role !== 'admin') {
      navigate('/')
      return
    }
    setAccessChecked(true)
  }, [user, profile, authLoading, navigate])

  // ── data fetchers ────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts(data ?? [])
    setProductsLoading(false)
  }, [])

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (!ordersData?.length) {
      setOrders([])
      setOrdersLoading(false)
      return
    }

    const userIds = [...new Set(ordersData.map(o => o.user_id))]
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds)

    const byId = Object.fromEntries((profilesData ?? []).map(p => [p.id, p]))
    setOrders(
      ordersData.map(o => ({
        ...o,
        user_email: byId[o.user_id]?.email ?? `${o.user_id.slice(0, 8)}…`,
      }))
    )
    setOrdersLoading(false)
  }, [])

  useEffect(() => {
    if (!accessChecked) return
    fetchProducts()
    fetchOrders()
  }, [accessChecked, fetchProducts, fetchOrders])

  // ── product delete ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('products').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    fetchProducts()
  }

  // ── order status update ──────────────────────────────────────────────────
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId)
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    }
    setUpdatingOrderId(null)
  }

  // ── loading / access check ───────────────────────────────────────────────
  if (authLoading || !accessChecked) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/5" />
        <div className="h-12 bg-gray-200 rounded-xl w-48" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="admin-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-400 text-sm mt-1">Manage products and orders</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8" data-testid="admin-tabs">
        {['products', 'orders'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            data-testid={`admin-tab-${tab}`}
          >
            {tab === 'products'
              ? `Products (${products.length})`
              : `Orders (${orders.length})`}
          </button>
        ))}
      </div>

      {/* ── Products tab ───────────────────────────────────────────────────── */}
      {activeTab === 'products' && (
        <div data-testid="admin-products-tab">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">All Products</h2>
            <button
              onClick={() => setModalProduct(null)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
              data-testid="add-product-btn"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>

          {productsLoading ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 bg-gray-200 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden" data-testid="admin-products-table">
              {products.length === 0 ? (
                <div className="text-center py-16 text-gray-400" data-testid="admin-products-empty">
                  No products yet.
                  <button
                    onClick={() => setModalProduct(null)}
                    className="block mx-auto mt-3 text-indigo-600 hover:underline text-sm"
                  >
                    Add your first product →
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-left">
                        <th className="px-5 py-3 w-10" />
                        <th className="px-5 py-3 font-semibold text-gray-600">Name</th>
                        <th className="px-5 py-3 font-semibold text-gray-600 hidden sm:table-cell">Category</th>
                        <th className="px-5 py-3 font-semibold text-gray-600">Price</th>
                        <th className="px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Stock</th>
                        <th className="px-5 py-3 font-semibold text-gray-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map(product => (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50 transition-colors"
                          data-testid={`admin-product-row-${product.id}`}
                        >
                          <td className="px-5 py-3">
                            <img
                              src={product.image_url || `https://picsum.photos/seed/${product.id}/32/32`}
                              alt=""
                              className="w-8 h-8 rounded object-cover"
                            />
                          </td>
                          <td className="px-5 py-3 font-medium text-gray-900 max-w-[200px] truncate" data-testid={`admin-product-name-${product.id}`}>
                            {product.name}
                          </td>
                          <td className="px-5 py-3 text-gray-500 hidden sm:table-cell" data-testid={`admin-product-category-${product.id}`}>
                            {product.category}
                          </td>
                          <td className="px-5 py-3 font-mono text-gray-700" data-testid={`admin-product-price-${product.id}`}>
                            ${Number(product.price).toFixed(2)}
                          </td>
                          <td className="px-5 py-3 hidden md:table-cell" data-testid={`admin-product-stock-${product.id}`}>
                            <span className={`font-semibold ${
                              product.stock_quantity === 0
                                ? 'text-red-500'
                                : product.stock_quantity < 5
                                ? 'text-amber-600'
                                : 'text-gray-700'
                            }`}>
                              {product.stock_quantity}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setModalProduct(product)}
                                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                                data-testid={`edit-product-${product.id}`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-500 transition-colors"
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

      {/* ── Orders tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div data-testid="admin-orders-tab">
          <h2 className="text-base font-semibold text-gray-900 mb-4">All Orders</h2>

          {ordersLoading ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 bg-gray-200 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden" data-testid="admin-orders-table">
              {orders.length === 0 ? (
                <div className="text-center py-16 text-gray-400" data-testid="admin-orders-empty">
                  No orders yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-left">
                        <th className="px-5 py-3 font-semibold text-gray-600">Order ID</th>
                        <th className="px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Customer</th>
                        <th className="px-5 py-3 font-semibold text-gray-600 hidden sm:table-cell">Date</th>
                        <th className="px-5 py-3 font-semibold text-gray-600">Status</th>
                        <th className="px-5 py-3 font-semibold text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map(order => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 transition-colors"
                          data-testid={`admin-order-row-${order.id}`}
                        >
                          <td className="px-5 py-3 font-mono font-bold text-gray-900" data-testid={`admin-order-id-${order.id}`}>
                            #{shortId(order.id)}
                          </td>
                          <td className="px-5 py-3 text-gray-500 hidden md:table-cell" data-testid={`admin-order-email-${order.id}`}>
                            <span className="truncate block max-w-[200px]">{order.user_email}</span>
                          </td>
                          <td className="px-5 py-3 text-gray-500 hidden sm:table-cell" data-testid={`admin-order-date-${order.id}`}>
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-5 py-3" data-testid={`admin-order-status-cell-${order.id}`}>
                            <div className="relative inline-block">
                              <select
                                value={order.status}
                                onChange={e => handleStatusChange(order.id, e.target.value)}
                                disabled={updatingOrderId === order.id}
                                className={`appearance-none text-xs font-semibold rounded-full pl-3 pr-7 py-1.5 border-0 cursor-pointer disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                  STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'
                                }`}
                                data-testid={`admin-order-status-select-${order.id}`}
                              >
                                {STATUS_OPTIONS.map(s => (
                                  <option key={s} value={s} className="bg-white text-gray-900 font-normal">
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </option>
                                ))}
                              </select>
                              <svg
                                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 opacity-60"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-5 py-3 font-mono font-semibold text-gray-900" data-testid={`admin-order-total-${order.id}`}>
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

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {modalProduct !== undefined && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSaved={() => { setModalProduct(undefined); fetchProducts() }}
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

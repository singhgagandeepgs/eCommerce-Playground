import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports']

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0]/50 animate-pulse">
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-100 rounded-full w-1/4" />
        <div className="h-4 bg-gray-100 rounded-full w-3/4" />
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-100 rounded-full w-1/4" />
          <div className="h-9 bg-gray-100 rounded-xl w-1/3" />
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      let query = supabase.from('products').select('*').order('created_at', { ascending: false })
      if (category !== 'All') query = query.eq('category', category)
      if (search.trim()) query = query.ilike('name', `%${search.trim()}%`)
      const { data } = await query
      setProducts(data ?? [])
      setLoading(false)
    }
    fetchProducts()
  }, [category, search])

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50/60">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-200/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-200/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#6366F1] bg-white border border-indigo-100 px-3 py-1.5 rounded-full shadow-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-pulse" />
            Premium Shopping Experience
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] leading-[1.1] tracking-tight max-w-2xl">
            Discover Products<br />
            <span className="gradient-text">You'll Love</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#64748B] max-w-xl leading-relaxed">
            Shop the latest trends in Electronics, Clothing, Books and more.
            Free shipping on orders over $50.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#products"
              className="btn-gradient text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2 text-sm"
            >
              Shop Now
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#products"
              className="bg-white text-[#0F172A] font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2 text-sm border border-[#E2E8F0] hover:border-[#6366F1]/30 transition-colors shadow-sm"
            >
              Browse categories
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {['8B5CF6', '6366F1', 'EC4899', '10B981', 'F59E0B'].map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full ring-2 ring-white flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: `#${color}` }}
                >
                  {['J', 'A', 'M', 'S', 'K'][i]}
                </div>
              ))}
            </div>
            <p className="text-sm text-[#64748B]">
              <span className="font-semibold text-[#0F172A]">10,000+</span> happy shoppers
            </p>
          </div>
        </div>
      </div>

      {/* ── Products ─────────────────────────────────────────────────────────── */}
      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Search + category filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field !pl-10"
              data-testid="search-input"
            />
          </div>
          <div className="flex gap-2 flex-wrap" data-testid="category-filters">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  category === cat
                    ? 'btn-gradient text-white shadow-sm'
                    : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#6366F1]/40 hover:text-[#0F172A]'
                }`}
                data-testid={`category-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24" data-testid="empty-products">
            <div className="w-20 h-20 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-[#0F172A]">No products found</p>
            <p className="text-sm text-[#64748B] mt-1">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

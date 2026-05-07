import { supabase } from '../config/supabase.js'

export async function listProducts(req, res, next) {
  try {
    const { category, search } = req.query
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (category) query = query.eq('category', category)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data, error } = await query
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function getProduct(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error?.code === 'PGRST116') return res.status(404).json({ error: 'Product not found' })
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
}

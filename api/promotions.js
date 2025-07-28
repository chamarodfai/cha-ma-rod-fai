import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all promotions
        const { data: promotions, error: getError } = await supabase
          .from('promotions')
          .select('*')
          .order('created_at', { ascending: false })

        if (getError) throw getError

        res.status(200).json(promotions)
        break

      case 'POST':
        // Create new promotion
        const { data: newPromotion, error: postError } = await supabase
          .from('promotions')
          .insert([req.body])
          .select()
          .single()

        if (postError) throw postError

        res.status(201).json(newPromotion)
        break

      case 'PUT':
        // Update promotion
        const { id, ...updateData } = req.body
        const { data: updatedPromotion, error: putError } = await supabase
          .from('promotions')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()

        if (putError) throw putError

        res.status(200).json(updatedPromotion)
        break

      case 'DELETE':
        // Delete promotion
        const { id: deleteId } = req.body
        const { error: deleteError } = await supabase
          .from('promotions')
          .delete()
          .eq('id', deleteId)

        if (deleteError) throw deleteError

        res.status(200).json({ message: 'Promotion deleted successfully' })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Promotions API Error:', error)
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    })
  }
}

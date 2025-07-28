import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://ectkqadvatwrodmqkuze.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2YXR3cm9kbXFrdXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTI1MDMsImV4cCI6MjA2OTEyODUwM30.vpKbaq98KYcMU_1s_co3oLLcjRvL010KYOrvf2JnpoE'

const supabase = createClient(supabaseUrl, supabaseKey)

// Fallback in-memory storage for development
let fallbackPromotions = [
  {
    id: 1,
    name: 'ลด 10%',
    type: 'percentage',
    value: 10,
    min_amount: 50,
    description: 'ลด 10% เมื่อซื้อครบ 50 บาท',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'ลด 20 บาท',
    type: 'fixed',
    value: 20,
    min_amount: 100,
    description: 'ลด 20 บาท เมื่อซื้อครบ 100 บาท',
    is_active: true,
    created_at: new Date().toISOString()
  }
]

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    switch (req.method) {
      case 'GET':
        // Try to get from Supabase first
        const { data: supabaseData, error: supabaseError } = await supabase
          .from('promotions')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (supabaseError) {
          console.log('Supabase error, using fallback:', supabaseError.message)
          return res.status(200).json(fallbackPromotions.filter(p => p.is_active))
        }

        return res.status(200).json(supabaseData || [])

      case 'POST':
        const newPromotion = {
          ...req.body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Try to insert to Supabase
        const { data: insertData, error: insertError } = await supabase
          .from('promotions')
          .insert([newPromotion])
          .select()
          .single()

        if (insertError) {
          console.log('Supabase insert error, using fallback:', insertError.message)
          // Fallback to memory
          const fallbackPromotion = {
            id: Date.now(),
            ...newPromotion
          }
          fallbackPromotions.push(fallbackPromotion)
          return res.status(201).json(fallbackPromotion)
        }

        return res.status(201).json(insertData)

      case 'DELETE':
        const { id: deleteId } = req.body

        // Try to delete from Supabase
        const { error: deleteError } = await supabase
          .from('promotions')
          .delete()
          .eq('id', deleteId)

        if (deleteError) {
          console.log('Supabase delete error, using fallback:', deleteError.message)
          // Fallback to memory
          fallbackPromotions = fallbackPromotions.filter(p => p.id !== deleteId)
          return res.status(200).json({ message: 'Promotion deleted (fallback)' })
        }

        return res.status(200).json({ message: 'Promotion deleted successfully' })

      case 'PUT':
        const { id: updateId, ...updateData } = req.body

        // Try to update in Supabase
        const { data: updateResult, error: updateError } = await supabase
          .from('promotions')
          .update({ 
            ...updateData, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', updateId)
          .select()
          .single()

        if (updateError) {
          console.log('Supabase update error, using fallback:', updateError.message)
          // Fallback to memory
          const promoIndex = fallbackPromotions.findIndex(p => p.id === updateId)
          if (promoIndex !== -1) {
            fallbackPromotions[promoIndex] = { 
              ...fallbackPromotions[promoIndex], 
              ...updateData,
              updated_at: new Date().toISOString()
            }
            return res.status(200).json(fallbackPromotions[promoIndex])
          }
          return res.status(404).json({ error: 'Promotion not found' })
        }

        return res.status(200).json(updateResult)

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error('Promotions API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    })
  }
}

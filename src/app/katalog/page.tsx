'use client'

import { useState, useEffect } from 'react'
import { supabase, CatalogItem } from '@/lib/supabase'
import Header from '@/components/Header'
import Link from 'next/link'

export default function CatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setItems(data || [])

      // Extract unique categories
      const cats = [...new Set(data?.map(item => item.category).filter(Boolean))] as string[]
      setCategories(cats)
    } catch (err) {
      console.error('Error fetching catalog:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory)

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="pt-24 px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <p className="text-gold tracking-[0.2em] text-sm mb-4 uppercase">Ekskluzivno</p>
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">Naša Kolekcija</h1>
            <div className="w-24 h-px bg-gold mx-auto" />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-2 text-sm tracking-wider uppercase transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-gold text-black'
                    : 'border border-gold/30 text-gold hover:border-gold'
                }`}
              >
                Sve
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 text-sm tracking-wider uppercase transition-all ${
                    selectedCategory === cat
                      ? 'bg-gold text-black'
                      : 'border border-gold/30 text-gold hover:border-gold'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-24">
              <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && items.length === 0 && (
            <div className="text-center py-24">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-white font-serif text-xl mb-2">Kolekcija je u pripremi</h3>
              <p className="text-white/60">Uskoro dodajemo nove komade. Pratite nas!</p>
            </div>
          )}

          {/* Catalog Grid */}
          {!loading && filteredItems.length > 0 && (
            <div className="catalog-grid">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="card-luxury overflow-hidden group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Link
                      href={`/probaj?item=${item.id}`}
                      className="absolute bottom-4 left-4 right-4 btn-gold text-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Probaj Virtuelno
                    </Link>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-serif text-lg">{item.title}</h3>
                    {item.description && (
                      <p className="text-white/60 text-sm mt-1 line-clamp-2">{item.description}</p>
                    )}
                    {item.category && (
                      <span className="inline-block mt-2 text-gold text-xs tracking-wider uppercase">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

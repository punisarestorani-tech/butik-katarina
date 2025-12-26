'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, CatalogItem } from '@/lib/supabase'
import { generateTryOn, fileToBase64 } from '@/lib/gemini'
import Header from '@/components/Header'
import toast from 'react-hot-toast'
import { Upload, Camera, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function TryOnPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([])
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null)
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    checkAuth()
    fetchCatalog()
  }, [])

  useEffect(() => {
    // Pre-select item if passed in URL
    const itemId = searchParams.get('item')
    if (itemId && catalogItems.length > 0) {
      const item = catalogItems.find(i => i.id === itemId)
      if (item) setSelectedItem(item)
    }
  }, [searchParams, catalogItems])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Prijavite se da biste koristili ovu funkciju')
      router.push('/prijava')
      return
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    setUser({ ...user, ...profile })
    setLoading(false)
  }

  const fetchCatalog = async () => {
    const { data } = await supabase
      .from('catalog_items')
      .select('*')
      .order('created_at', { ascending: false })

    setCatalogItems(data || [])
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await fileToBase64(file)
        setUserPhoto(base64)
        setResult(null)
      } catch (err) {
        toast.error('Greška pri učitavanju slike')
      }
    }
  }

  const handleTryOn = async () => {
    if (!userPhoto) {
      toast.error('Dodajte svoju fotografiju')
      return
    }

    if (!selectedItem) {
      toast.error('Izaberite artikal iz kataloga')
      return
    }

    setGenerating(true)
    setResult(null)

    try {
      // Get clothing image as base64
      const clothingResponse = await fetch(selectedItem.image_url)
      const clothingBlob = await clothingResponse.blob()
      const clothingBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(clothingBlob)
      })

      const generatedResult = await generateTryOn(userPhoto, clothingBase64)
      setResult(generatedResult)
      toast.success('Slika generisana!')

      // Save to history
      if (user) {
        await supabase.from('try_on_results').insert({
          user_id: user.id,
          user_image_url: userPhoto,
          clothing_item_id: selectedItem.id,
          result_image_url: generatedResult,
        })
      }
    } catch (err: any) {
      toast.error(err.message || 'Greška pri generisanju')
    } finally {
      setGenerating(false)
    }
  }

  const scrollCatalog = (direction: 'left' | 'right') => {
    const container = document.getElementById('catalog-scroll')
    if (container) {
      const scrollAmount = 300
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header user={user ? { name: user.name, email: user.email, is_admin: user.is_admin } : null} />

      <div className="pt-24 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-gold tracking-[0.2em] text-sm mb-4 uppercase">AI Tehnologija</p>
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">Virtuelno Probavanje</h1>
            <p className="text-white/60 max-w-xl mx-auto">
              Dodajte svoju fotografiju i izaberite odjevni predmet iz kataloga da vidite kako izgleda na vama.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* User Photo Section */}
            <div className="card-luxury p-6">
              <h2 className="font-serif text-xl text-white mb-4 flex items-center gap-2">
                <Camera className="text-gold" size={20} />
                Vaša Fotografija
              </h2>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="upload-area min-h-[300px] flex items-center justify-center"
              >
                {userPhoto ? (
                  <div className="relative w-full">
                    <img
                      src={userPhoto}
                      alt="Your photo"
                      className="max-h-[400px] mx-auto object-contain"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setUserPhoto(null)
                        setResult(null)
                      }}
                      className="absolute top-2 right-2 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center text-white hover:text-gold"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-16 h-16 text-gold/50 mx-auto mb-4" />
                    <p className="text-white/80 text-lg mb-2">Dodajte fotografiju</p>
                    <p className="text-white/40 text-sm">
                      Najbolji rezultati sa fotografijom cijele figure
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Result Section */}
            <div className="card-luxury p-6">
              <h2 className="font-serif text-xl text-white mb-4 flex items-center gap-2">
                <Sparkles className="text-gold" size={20} />
                Rezultat
              </h2>

              <div className="min-h-[300px] flex items-center justify-center bg-white/5 rounded border border-gold/10">
                {generating ? (
                  <div className="text-center">
                    <div className="w-16 h-16 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gold">Generisanje u toku...</p>
                    <p className="text-white/40 text-sm mt-1">Ovo može potrajati do 30 sekundi</p>
                  </div>
                ) : result ? (
                  <div className="p-4 w-full">
                    <div className="bg-white/5 rounded p-4 whitespace-pre-wrap text-white/80 text-sm max-h-[400px] overflow-y-auto">
                      {result}
                    </div>
                    <p className="text-white/40 text-xs mt-4 text-center">
                      Napomena: Za generisanje slika potreban je Gemini model sa podrškom za generisanje slika.
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-white/40">
                    <p>Rezultat će se prikazati ovdje</p>
                    <p className="text-sm mt-1">Dodajte fotografiju i izaberite artikal</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Catalog Selection */}
          <div className="card-luxury p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-white">Izaberite Artikal</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollCatalog('left')}
                  className="w-10 h-10 flex items-center justify-center border border-gold/30 text-gold hover:bg-gold/10 rounded transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scrollCatalog('right')}
                  className="w-10 h-10 flex items-center justify-center border border-gold/30 text-gold hover:bg-gold/10 rounded transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {catalogItems.length === 0 ? (
              <p className="text-white/60 text-center py-8">Katalog je prazan</p>
            ) : (
              <div
                id="catalog-scroll"
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {catalogItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`flex-shrink-0 w-36 cursor-pointer group transition-all ${
                      selectedItem?.id === item.id
                        ? 'ring-2 ring-gold'
                        : 'hover:ring-1 hover:ring-gold/50'
                    }`}
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-2 bg-black/50">
                      <p className="text-white text-sm truncate">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="text-center mt-8">
            <button
              onClick={handleTryOn}
              disabled={generating || !userPhoto || !selectedItem}
              className="btn-gold text-lg px-12 py-4 pulse-gold"
            >
              {generating ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  Generisanje...
                </>
              ) : (
                <>
                  <Sparkles className="inline-block mr-2" size={20} />
                  Generiši Probavanje
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, CatalogItem } from '@/lib/supabase'
import Header from '@/components/Header'
import toast from 'react-hot-toast'
import { Upload, Trash2, Edit, X, Check } from 'lucide-react'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<CatalogItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    fetchItems()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/prijava')
      return
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      toast.error('Nemate pristup admin panelu')
      router.push('/')
      return
    }

    setUser(user)
    setLoading(false)
  }

  const fetchItems = async () => {
    const { data } = await supabase
      .from('catalog_items')
      .select('*')
      .order('created_at', { ascending: false })

    setItems(data || [])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile && !editingItem) {
      toast.error('Izaberite sliku')
      return
    }

    if (!title.trim()) {
      toast.error('Unesite naziv')
      return
    }

    setUploading(true)

    try {
      let imageUrl = editingItem?.image_url || ''

      // Upload new image if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `catalog/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('clothing')
          .upload(filePath, selectedFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('clothing')
          .getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('catalog_items')
          .update({
            title,
            description,
            category,
            image_url: imageUrl,
          })
          .eq('id', editingItem.id)

        if (error) throw error
        toast.success('Artikal ažuriran!')
      } else {
        // Create new item
        const { error } = await supabase
          .from('catalog_items')
          .insert({
            title,
            description,
            category,
            image_url: imageUrl,
          })

        if (error) throw error
        toast.success('Artikal dodat!')
      }

      // Reset form
      resetForm()
      fetchItems()
    } catch (err: any) {
      toast.error(err.message || 'Greška pri uploadu')
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('')
    setSelectedFile(null)
    setPreview(null)
    setEditingItem(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleEdit = (item: CatalogItem) => {
    setEditingItem(item)
    setTitle(item.title)
    setDescription(item.description || '')
    setCategory(item.category || '')
    setPreview(item.image_url)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovaj artikal?')) return

    try {
      const { error } = await supabase
        .from('catalog_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Artikal obrisan!')
      fetchItems()
    } catch (err: any) {
      toast.error('Greška pri brisanju')
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
      <Header user={user ? { name: 'Admin', email: '', is_admin: true } : null} />

      <div className="pt-24 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-gold tracking-[0.2em] text-sm mb-4 uppercase">Administracija</p>
            <h1 className="font-serif text-4xl text-white mb-4">Upravljanje Katalogom</h1>
            <div className="w-24 h-px bg-gold mx-auto" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Form */}
            <div className="card-luxury p-6">
              <h2 className="font-serif text-xl text-white mb-6">
                {editingItem ? 'Uredi Artikal' : 'Dodaj Novi Artikal'}
              </h2>

              <form onSubmit={handleUpload} className="space-y-5">
                {/* Image Upload */}
                <div>
                  <label className="block text-gold text-sm mb-2 tracking-wider uppercase">
                    Slika
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="upload-area"
                  >
                    {preview ? (
                      <div className="relative">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-48 mx-auto object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreview(null)
                            setSelectedFile(null)
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center text-white hover:text-gold"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gold/50 mx-auto mb-4" />
                        <p className="text-white/60">Kliknite za upload slike</p>
                        <p className="text-white/40 text-sm mt-1">PNG, JPG do 10MB</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-gold text-sm mb-2 tracking-wider uppercase">
                    Naziv
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-luxury"
                    placeholder="Naziv artikla"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gold text-sm mb-2 tracking-wider uppercase">
                    Opis (opciono)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-luxury min-h-[100px] resize-none"
                    placeholder="Kratki opis artikla..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-gold text-sm mb-2 tracking-wider uppercase">
                    Kategorija (opciono)
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-luxury"
                    placeholder="npr. Haljine, Bluze, Pantalone..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn-gold flex-1"
                  >
                    {uploading ? 'Upload...' : editingItem ? 'Sačuvaj Izmjene' : 'Dodaj Artikal'}
                  </button>
                  {editingItem && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn-outline"
                    >
                      Otkaži
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Items List */}
            <div className="card-luxury p-6">
              <h2 className="font-serif text-xl text-white mb-6">
                Artikli u Katalogu ({items.length})
              </h2>

              {items.length === 0 ? (
                <p className="text-white/60 text-center py-8">Nema artikala u katalogu</p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3 bg-white/5 rounded border border-gold/10"
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{item.title}</h3>
                        {item.category && (
                          <span className="text-gold text-xs">{item.category}</span>
                        )}
                        {item.description && (
                          <p className="text-white/50 text-sm truncate mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="w-8 h-8 flex items-center justify-center text-gold hover:bg-gold/10 rounded transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

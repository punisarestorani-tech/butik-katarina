'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [instagram, setInstagram] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Lozinke se ne podudaraju')
      return
    }

    if (password.length < 6) {
      toast.error('Lozinka mora imati najmanje 6 karaktera')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            instagram_handle: instagram,
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Ovaj email je već registrovan')
        } else {
          toast.error(error.message)
        }
        return
      }

      if (data.user) {
        // Create user profile
        await supabase.from('users').insert({
          id: data.user.id,
          name,
          email,
          instagram_handle: instagram,
          is_admin: false,
        })

        toast.success('Uspješna registracija!')
        router.push('/probaj')
        router.refresh()
      }
    } catch (err) {
      toast.error('Došlo je do greške')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="card-luxury p-8 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl text-white mb-2">Kreirajte Nalog</h1>
              <p className="text-white/60">Pridružite se Butik Katarina zajednici</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-gold text-sm mb-2 tracking-wider uppercase">
                  Ime i Prezime
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-luxury"
                  placeholder="Vaše ime"
                  required
                />
              </div>

              <div>
                <label className="block text-gold text-sm mb-2 tracking-wider uppercase">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-luxury"
                  placeholder="vas@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-gold text-sm mb-2 tracking-wider uppercase">
                  Instagram (opciono)
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="input-luxury"
                  placeholder="@vas_instagram"
                />
              </div>

              <div>
                <label className="block text-gold text-sm mb-2 tracking-wider uppercase">
                  Lozinka
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-luxury"
                  placeholder="Najmanje 6 karaktera"
                  required
                />
              </div>

              <div>
                <label className="block text-gold text-sm mb-2 tracking-wider uppercase">
                  Potvrdi Lozinku
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-luxury"
                  placeholder="Ponovite lozinku"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full"
              >
                {loading ? 'Registracija...' : 'Registruj se'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm">
                Već imate nalog?{' '}
                <Link href="/prijava" className="text-gold hover:text-gold-light transition-colors">
                  Prijavite se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

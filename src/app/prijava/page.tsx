'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error('Pogrešan email ili lozinka')
        return
      }

      toast.success('Uspješna prijava!')
      router.push('/probaj')
      router.refresh()
    } catch (err) {
      toast.error('Došlo je do greške')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="card-luxury p-8 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl text-white mb-2">Dobrodošli</h1>
              <p className="text-white/60">Prijavite se na vaš nalog</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
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
                  Lozinka
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-luxury"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full"
              >
                {loading ? 'Prijava...' : 'Prijavi se'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm">
                Nemate nalog?{' '}
                <Link href="/registracija" className="text-gold hover:text-gold-light transition-colors">
                  Registrujte se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

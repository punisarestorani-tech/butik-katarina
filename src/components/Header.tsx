'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, User, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  user?: {
    name: string
    email: string
    is_admin: boolean
  } | null
}

export default function Header({ user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-gold font-serif text-xl tracking-widest">BUTIK KATARINA</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/katalog" className="text-white/80 hover:text-gold transition-colors text-sm tracking-wider uppercase">
              Katalog
            </Link>
            {user ? (
              <>
                <Link href="/probaj" className="text-white/80 hover:text-gold transition-colors text-sm tracking-wider uppercase">
                  Probaj
                </Link>
                {user.is_admin && (
                  <Link href="/admin" className="text-white/80 hover:text-gold transition-colors text-sm tracking-wider uppercase">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-gold/80 text-sm">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-white/60 hover:text-gold transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <Link href="/prijava" className="btn-gold text-sm py-2 px-6">
                Prijavi se
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gold/20 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/katalog"
                className="text-white/80 hover:text-gold transition-colors text-sm tracking-wider uppercase"
                onClick={() => setMenuOpen(false)}
              >
                Katalog
              </Link>
              {user ? (
                <>
                  <Link
                    href="/probaj"
                    className="text-white/80 hover:text-gold transition-colors text-sm tracking-wider uppercase"
                    onClick={() => setMenuOpen(false)}
                  >
                    Probaj
                  </Link>
                  {user.is_admin && (
                    <Link
                      href="/admin"
                      className="text-white/80 hover:text-gold transition-colors text-sm tracking-wider uppercase"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-left text-white/60 hover:text-gold transition-colors text-sm tracking-wider uppercase"
                  >
                    Odjavi se
                  </button>
                </>
              ) : (
                <Link
                  href="/prijava"
                  className="btn-gold text-sm py-2 px-6 text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Prijavi se
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

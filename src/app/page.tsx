import Link from 'next/link'
import Header from '@/components/Header'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />

        {/* Gold accent lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <p className="text-gold tracking-[0.3em] text-sm mb-6 uppercase">Dobrodosli u</p>
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 tracking-wide">
            BUTIK KATARINA
          </h1>
          <p className="text-gold tracking-[0.2em] text-lg mb-4">BUDVA</p>
          <div className="w-24 h-px bg-gold mx-auto mb-8" />
          <p className="text-white/70 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Ekskluzivna kolekcija odjeće sa jedinstvenom mogucnoscu virtuelnog probavanja.
            Otkrijte savrsenu garderobu bez napustanja svog doma.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/katalog" className="btn-gold">
              Pregledaj Kolekciju
            </Link>
            <Link href="/prijava" className="btn-outline">
              Probaj Virtuelno
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-px h-16 bg-gradient-to-b from-gold/50 to-transparent" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold tracking-[0.2em] text-sm mb-4 uppercase">Zasto Mi</p>
            <h2 className="font-serif text-3xl md:text-4xl text-white">Jedinstveno Iskustvo</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-luxury p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white font-serif text-xl mb-4">AI Virtuelno Probavanje</h3>
              <p className="text-white/60">
                Pogledajte kako odjevni predmeti izgledaju na vama pomocu napredne AI tehnologije.
              </p>
            </div>

            <div className="card-luxury p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-white font-serif text-xl mb-4">Ekskluzivna Kolekcija</h3>
              <p className="text-white/60">
                Pazljivo odabrani komadi iz najnovijih kolekcija za istancani ukus.
              </p>
            </div>

            <div className="card-luxury p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-serif text-xl mb-4">Brza Dostava</h3>
              <p className="text-white/60">
                Besplatna dostava za Budvu i okolinu. Brza isporuka za cijelu Crnu Goru.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-black to-black/95">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">
            Spremni za Novo Iskustvo?
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Registrujte se besplatno i otkrijte kako nasa kolekcija izgleda na vama.
          </p>
          <Link href="/registracija" className="btn-gold">
            Kreiraj Nalog
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gold/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <p className="text-white/40 text-sm">
            2024 Butik Katarina Budva. Sva prava zadrzana.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="https://instagram.com/butikkatarinabudva" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

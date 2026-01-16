'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Home, Store, Calendar, FileText, History, Phone } from 'lucide-react'

const navigation = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Directorio', href: '/directorio', icon: Store },
  { name: 'Eventos', href: '/eventos', icon: Calendar },
  { name: 'Trámites', href: '/tramites', icon: FileText },
  { name: 'Historia', href: '/historia', icon: History },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-verde-jac-500 text-white sticky top-0 z-50 shadow-lg">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-verde-jac-500 font-bold text-lg">JAC</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-lg leading-tight">San José y El Bosque</p>
                <p className="text-xs text-verde-jac-100">Armenia, Quindío</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium hover:bg-verde-jac-600 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Contact Button (Desktop) */}
          <div className="hidden md:flex items-center">
            <a
              href="tel:+573001234567"
              className="flex items-center space-x-2 bg-amarillo-sol-500 text-verde-jac-900 px-4 py-2 rounded-lg font-medium hover:bg-amarillo-sol-400 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Contactar</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-verde-jac-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Abrir menú</span>
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-verde-jac-400">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium hover:bg-verde-jac-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <a
                href="tel:+573001234567"
                className="flex items-center space-x-3 px-4 py-3 bg-amarillo-sol-500 text-verde-jac-900 rounded-lg font-medium mt-4"
              >
                <Phone className="w-5 h-5" />
                <span>Llamar a la JAC</span>
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

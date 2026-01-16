import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Facebook, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información JAC */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-verde-jac-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">JAC</span>
              </div>
              <div>
                <h3 className="text-white font-bold">JAC San José y El Bosque</h3>
                <p className="text-sm text-gray-400">Armenia, Quindío</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Junta de Acción Comunal trabajando por el bienestar y desarrollo de nuestra comunidad.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-verde-jac-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://wa.me/573001234567" className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-verde-jac-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Oficina JAC, Barrio San José, Armenia, Quindío</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-verde-jac-500 flex-shrink-0" />
                <a href="tel:+573001234567" className="text-sm hover:text-verde-jac-400">+57 300 123 4567</a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-verde-jac-500 flex-shrink-0" />
                <a href="mailto:jac.sanjose@example.com" className="text-sm hover:text-verde-jac-400">jac.sanjose@example.com</a>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-verde-jac-500 flex-shrink-0" />
                <span className="text-sm">Lunes a Viernes: 8:00 AM - 12:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/directorio" className="text-sm hover:text-verde-jac-400 transition-colors">
                  Directorio de Negocios
                </Link>
              </li>
              <li>
                <Link href="/eventos" className="text-sm hover:text-verde-jac-400 transition-colors">
                  Calendario de Eventos
                </Link>
              </li>
              <li>
                <Link href="/tramites" className="text-sm hover:text-verde-jac-400 transition-colors">
                  Trámites JAC
                </Link>
              </li>
              <li>
                <Link href="/historia" className="text-sm hover:text-verde-jac-400 transition-colors">
                  Historia del Barrio
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} JAC Barrio San José y El Bosque. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Desarrollado con amor para nuestra comunidad
          </p>
        </div>
      </div>
    </footer>
  )
}

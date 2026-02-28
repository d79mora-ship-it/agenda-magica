'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
    { href: '/', label: '🏠 Portada' },
    { href: '/calendario', label: '📅 Calendario' },
    { href: '/horario', label: '📚 Horario' },
    { href: '/semana', label: '📝 Semana' },
    { href: '/habitos', label: '🌱 Hábitos' },
    { href: '/notas', label: '📌 Notas' },
    { href: '/emociones', label: '💛 Emociones' },
    { href: '/extras', label: '🎨 Extras' },
]

export default function Navigation() {
    const pathname = usePathname()

    return (
        <nav className="top-nav" role="navigation" aria-label="Secciones de la agenda">
            <div className="nav-logo">📓 Mi Agenda</div>
            <ul className="nav-links">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <li key={item.href}>
                            <Link href={item.href}>
                                <button className={`nav-btn ${isActive ? 'active' : ''}`}>
                                    {item.label}
                                </button>
                            </Link>
                        </li>
                    )
                })}
            </ul>
            <form action="/auth/signout" method="post" className="flex-shrink-0">
                <button className="print-btn" title="Cerrar sesión">Salir 👋</button>
            </form>
        </nav>
    )
}

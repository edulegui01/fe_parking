import { Outlet, NavLink } from 'react-router-dom';
import logoUrl from '@/assets/lcosta_sin_fondo.png';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-brand-blue text-white px-6 py-4 flex items-center gap-4 shadow-md">
        <img src={logoUrl} alt="" className="h-8 w-auto object-contain brightness-0 invert opacity-90" />
        <div className="h-6 w-px bg-white/20" />
        <span className="text-lg font-semibold tracking-tight">Panel Administrativo</span>
        <nav className="ml-auto flex items-center gap-1">
          <NavLink
            to="/admin/nfc"
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`
            }
          >
            Tarjetas NFC
          </NavLink>
        </nav>
      </header>
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useCatalogConfig } from '../hooks/useCatalogConfig';

export default function Navbar() {
  const { search, pathname } = useLocation();
  const currentKind = new URLSearchParams(search).get('kind');
  const qs = new URLSearchParams(search);
  // Prioriza el QP; cae a localStorage para que persista entre navegaciones directas
  const currentStore =
    qs.get('store') || localStorage.getItem('activeStore');

  const { storeById } = useCatalogConfig();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const activeStore = currentStore ? storeById[currentStore] : null;
  const storeLogo = activeStore?.logo ?? null;
  const storeName = activeStore?.name ?? '';

  // Cierra el dropdown al hacer click fuera del contenedor
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // La Navbar no se muestra en la pantalla de selección de tienda
  if (!pathname.startsWith('/products') && !pathname.startsWith('/categories')) {
    return null;
  }

  const links = [
    { name: 'Tiendas', to: '/' },
    {
      name: 'Categorias',
      to: `/categories${currentStore ? `?store=${currentStore}` : ''}`,
    },
  ];

  const adminLinks = [
    { name: 'Crear producto', to: '/products/new' },
    { name: 'Ordenar / Visibilidad', to: '/products/sort' },
  ];

  const isAdminActive =
    pathname === '/products/new' ||
    pathname === '/products/sort' ||
    pathname.endsWith('/edit');

  return (
    <nav className='w-full bg-transparent border-b border-slate-200 dark:border-slate-700'>
      <div className='py-4 flex flex-wrap justify-between items-center max-w-5xl mx-auto'>
        <div className='flex items-center gap-3'>
          {/* Logo dinámico según la tienda */}
          {storeLogo && (
            <img
              src={storeLogo}
              alt={storeName}
              className='h-12 w-12 object-contain rounded-full border border-slate-300 dark:border-slate-600'
            />
          )}
          <h1 className='hidden sm:block text-xl font-bold text-slate-900 dark:text-slate-50'>
            {storeName ? `${storeName} · Catálogo` : 'SmokeShop · Catálogo'}
          </h1>
        </div>

        <div className='flex flex-wrap gap-3 mt-3 sm:mt-0'>
          {links.map((link) => {
            const isActive =
              (link.name === 'Categorias' && pathname.startsWith('/categories')) ||
              (currentKind && link.to.includes(currentKind));
            return (
              <Link
                key={link.name}
                to={link.to}
                className={`text-white bg-linear-to-br from-purple-600 to-blue-500 hover:bg-linear-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-4 py-2 text-center
                  ${
                    isActive
                      ? 'bg-slate-50 text-slate-900 shadow'
                      : 'bg-slate-700 text-slate-50 hover:bg-slate-500 transition-colors duration-150'
                  }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Dropdown Gestionar */}
          <div className='relative' ref={menuRef}>
            <button
              type='button'
              onClick={() => setMenuOpen((o) => !o)}
              className={`flex items-center gap-1 font-medium rounded-lg text-sm px-4 py-2 text-white bg-linear-to-br from-purple-600 to-blue-500 hover:bg-linear-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors duration-150 ${
                isAdminActive ? 'ring-2 ring-blue-400' : ''
              }`}
            >
              Gestionar
              <svg
                className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 10 6'
              >
                <path
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='m1 1 4 4 4-4'
                />
              </svg>
            </button>

            {menuOpen && (
              <div className='absolute right-0 z-50 mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800'>
                {adminLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className='block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg'
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

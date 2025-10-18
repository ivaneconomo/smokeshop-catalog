import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

// ──────────────────────────────
// Definí aquí las tiendas y sus logos
// ──────────────────────────────
const STORES = {
  store_6: {
    name: 'The Kings Shop',
    logo: '/images/logo_kings.png',
  },
  store_22: {
    name: 'Smoke Shop Souvenir',
    logo: '/images/logo_souvenir.png',
  },
  store_28: {
    name: 'Exotic Smoke Shop',
    logo: '/images/logo_exotic.png',
  },
};

export default function Navbar() {
  const { search, pathname } = useLocation();
  const currentKind = new URLSearchParams(search).get('kind');
  const currentStore =
    new URLSearchParams(search).get('store') ||
    localStorage.getItem('activeStore');

  const [storeLogo, setStoreLogo] = useState(null);
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    if (currentStore && STORES[currentStore]) {
      setStoreLogo(STORES[currentStore].logo);
      setStoreName(STORES[currentStore].name);
    } else {
      setStoreLogo(null);
      setStoreName('');
    }
  }, [currentStore]);

  if (pathname !== '/products') return null;

  const links = [
    { name: 'Tiendas', to: '/' },
    // { name: 'Nicotine', to: '/products?kind=NicDisposable' },
    // { name: 'HHC', to: '/products?kind=HHCDisposable' },
    // { name: 'Edibles', to: '/products?kind=Edible' },
  ];

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
              link.to.includes(currentKind) ||
              (!currentKind && link.name === 'Todos');
            return (
              <Link
                key={link.name}
                to={link.to}
                className={`px-4 py-1 rounded-md font-medium text-sm transition-colors duration-150
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
        </div>
      </div>
    </nav>
  );
}

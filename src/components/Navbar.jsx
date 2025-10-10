import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { search } = useLocation();
  const currentKind = new URLSearchParams(search).get('kind');
  const { pathname } = useLocation();
  if (pathname !== '/products') return null;

  const links = [
    { name: 'Tiendas', to: '/' },
    { name: 'Nicotine', to: '/products?kind=NicDisposable' },
    { name: 'HHC', to: '/products?kind=HHCDisposable' },
    { name: 'Edibles', to: '/products?kind=Edible' },
  ];

  return (
    <nav className='w-full'>
      <div className='max-w-screen-md mx-auto py-3 flex flex-wrap justify-center gap-4 sm:justify-between sm:items-center'>
        <h1 className='text-xl font-bold text-slate-900 dark:text-slate-50'>
          SmokeShop · Catálogo
        </h1>
        <div className='flex flex-wrap gap-3'>
          {links.map((link) => {
            const isActive =
              link.to.includes(currentKind) ||
              (!currentKind && link.name === 'Todos');
            return (
              <Link
                key={link.name}
                to={link.to}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-150
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

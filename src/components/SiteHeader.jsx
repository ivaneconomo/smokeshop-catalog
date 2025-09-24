export default function SiteHeader() {
  return (
    <header className='sticky top-0 z-40 border-b bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70'>
      <div className='mx-auto flex h-14 max-w-7xl items-center justify-between px-4'>
        <div className='flex items-center gap-2'>
          <div className='h-6 w-6 rounded bg-brand-gold' />
          <span className='text-sm font-semibold tracking-wide'>
            SmokeShop · Catálogo
          </span>
        </div>
        <nav className='hidden gap-6 text-sm sm:flex'>
          <a href='#vapes' className='opacity-80 hover:opacity-100'>
            Vapes
          </a>
          <a className='pointer-events-none opacity-30'>Pods</a>
          <a className='pointer-events-none opacity-30'>Accesorios</a>
        </nav>
      </div>
    </header>
  );
}

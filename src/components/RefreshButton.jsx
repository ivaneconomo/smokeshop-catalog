// Ejemplo de botón (puedes colocarlo en ProductsCatalog)
import { cacheKeyForProducts } from '../utils/cache';

function RefreshButton({ storeId, kind, version = 'v1' }) {
  const onRefresh = () => {
    const key = cacheKeyForProducts(storeId, version, kind || '__all__');
    localStorage.removeItem(key);
    // Vuelve a renderizar/recargar
    window.location.reload();
  };

  return (
    <button className='px-3 py-1 text-md' onClick={onRefresh}>
      <span className='material-symbols-outlined'>🔄️</span>
    </button>
  );
}
export default RefreshButton;

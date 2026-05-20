export default function CatalogEmptyState({ message = 'No hay productos para mostrar.' }) {
  return <p className='text-slate-500 my-8'>{message}</p>;
}

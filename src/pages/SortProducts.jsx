import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getProducts, reorderProducts, getKindVisibility, updateKindVisibility, updateProduct } from '../services/api';
import { toast } from 'react-hot-toast';


function SortableRow({ product, onToggleVisible }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product._id });

  const visible = product.catalog_visible !== false;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-sm transition-colors ${
        visible
          ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className='cursor-grab active:cursor-grabbing text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 touch-none'
        aria-label='Arrastrar'
      >
        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='currentColor' viewBox='0 0 256 256'>
          <path d='M104,60a12,12,0,1,1,12,12A12,12,0,0,1,104,60Zm12,44a12,12,0,1,0,12,12A12,12,0,0,0,116,104Zm0,56a12,12,0,1,0,12,12A12,12,0,0,0,116,160Zm24-96a12,12,0,1,0,12,12A12,12,0,0,0,140,64Zm0,56a12,12,0,1,0,12,12A12,12,0,0,0,140,120Zm0,56a12,12,0,1,0,12,12A12,12,0,0,0,140,176Z'/>
        </svg>
      </button>

      <div className={`flex-1 min-w-0 ${!visible ? 'opacity-40' : ''}`}>
        <span className='font-medium text-slate-900 dark:text-slate-100'>
          {product.brand}
        </span>
        <span className='ml-2 text-slate-500 dark:text-slate-400'>
          {product.model}
        </span>
      </div>

      {product.puffs > 0 && (
        <span className={`text-xs text-slate-400 ${!visible ? 'opacity-40' : ''}`}>{product.puffs} puffs</span>
      )}
      {product.grams > 0 && (
        <span className={`text-xs text-slate-400 ${!visible ? 'opacity-40' : ''}`}>{product.grams}g</span>
      )}
      {product.dosage_mg > 0 && (
        <span className={`text-xs text-slate-400 ${!visible ? 'opacity-40' : ''}`}>{product.dosage_mg}mg</span>
      )}

      <button
        type='button'
        onClick={() => onToggleVisible(product._id, visible)}
        className={`transition ${visible ? 'text-emerald-500 hover:text-slate-400' : 'text-slate-300 hover:text-emerald-500 dark:text-slate-600'}`}
        aria-label={visible ? 'Ocultar' : 'Mostrar'}
      >
        {visible ? (
          <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='currentColor' viewBox='0 0 256 256'>
            <path d='M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z'/>
          </svg>
        ) : (
          <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='currentColor' viewBox='0 0 256 256'>
            <path d='M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.84,9.38,123.2,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a126.92,126.92,0,0,0,52.1-10.84l22,24.22a8,8,0,1,0,11.84-10.76Zm47.33,75.84,41.67,45.85a32,32,0,0,1-41.67-45.85ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.16,133.16,0,0,1,25,128c4.69-8.79,19.66-33.39,47.35-49.38l18.41,20.26a48,48,0,0,0,63.89,70.3L173.2,191A111,111,0,0,1,128,192Zm6-95.43a8,8,0,0,1,3.82-15.52,48.16,48.16,0,0,1,38.12,42,8,8,0,0,1-7.28,8.65,6.39,6.39,0,0,1-.7,0,8,8,0,0,1-8-7.39A32.12,32.12,0,0,0,134,96.57Zm113.28,34.69c-.42.94-10.55,23.37-33.36,43l-11.7-12.87c.8-.9,1.6-1.81,2.37-2.73A133.16,133.16,0,0,0,231,128a133.31,133.31,0,0,0-23.07-30.75C185.67,75.19,158.78,64,128,64a118,118,0,0,0-19.36,1.57L96.3,51.83A126.83,126.83,0,0,1,128,48c34.88,0,66.57,13.26,91.66,38.35,18.83,18.83,27.3,37.6,27.65,38.4A8,8,0,0,1,247.31,131.26Z'/>
          </svg>
        )}
      </button>

      <Link
        to={`/products/${product._id}/edit`}
        className='text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition'
        aria-label='Editar'
      >
        <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' viewBox='0 0 256 256'>
          <path d='M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z'/>
        </svg>
      </Link>
    </div>
  );
}

export default function SortProducts() {
  const [allProducts, setAllProducts] = useState([]);
  const [availableKinds, setAvailableKinds] = useState([]);
  const [hiddenKinds, setHiddenKinds] = useState([]);
  const [kind, setKind] = useState('Nicotine');
  const [list, setList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getKindVisibility()])
      .then(([data, vis]) => {
        const products = Array.isArray(data) ? data : data?.items || [];
        setAllProducts(products);
        const kinds = [...new Set(products.map((p) => p.kind).filter(Boolean))].sort();
        setAvailableKinds(kinds);
        if (kinds.length > 0) setKind(kinds[0]);
        setHiddenKinds(vis.hidden_kinds ?? []);
      })
      .catch(() => toast.error('Error al cargar datos'))
      .finally(() => setLoading(false));
  }, []);

  const toggleKindVisibility = (k) => {
    setHiddenKinds((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  };

  const handleSaveVisibility = async () => {
    setSavingVisibility(true);
    try {
      await updateKindVisibility(hiddenKinds);
      toast.success('Visibilidad guardada');
    } catch {
      toast.error('Error al guardar visibilidad');
    } finally {
      setSavingVisibility(false);
    }
  };

  useEffect(() => {
    const filtered = allProducts
      .filter((p) => p.kind === kind)
      .sort((a, b) => (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity));
    setList(filtered);
  }, [allProducts, kind]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setList((prev) => {
      const oldIndex = prev.findIndex((p) => p._id === active.id);
      const newIndex = prev.findIndex((p) => p._id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleToggleVisible = async (productId, currentVisible) => {
    const next = !currentVisible;
    setAllProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, catalog_visible: next } : p)),
    );
    try {
      await updateProduct(productId, { catalog_visible: next });
    } catch {
      setAllProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, catalog_visible: currentVisible } : p)),
      );
      toast.error('Error al cambiar visibilidad');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await reorderProducts(list.map((p) => p._id));
      setAllProducts((prev) =>
        prev.map((p) => {
          const idx = list.findIndex((l) => l._id === p._id);
          return idx !== -1 ? { ...p, sort_order: idx } : p;
        }),
      );
      toast.success('Orden guardado');
    } catch {
      toast.error('Error al guardar el orden');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className='py-6 space-y-5'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
          Ordenar productos
        </h2>
        <button
          onClick={handleSave}
          disabled={saving || list.length === 0}
          className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition'
        >
          {saving ? 'Guardando…' : 'Guardar orden'}
        </button>
      </div>

      {/* Visibilidad de categorías */}
      {!loading && availableKinds.length > 0 && (
        <div className='rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3'>
          <p className='text-sm font-medium text-slate-700 dark:text-slate-200'>
            Visibilidad en el catálogo
          </p>
          <div className='flex flex-wrap gap-3'>
            {availableKinds.map((k) => {
              const visible = !hiddenKinds.includes(k);
              return (
                <label key={k} className='flex items-center gap-2 cursor-pointer select-none text-sm text-slate-700 dark:text-slate-200'>
                  <input
                    type='checkbox'
                    checked={visible}
                    onChange={() => toggleKindVisibility(k)}
                    className='w-4 h-4 accent-blue-600'
                  />
                  {k}
                </label>
              );
            })}
          </div>
          <button
            onClick={handleSaveVisibility}
            disabled={savingVisibility}
            className='rounded-lg bg-slate-700 dark:bg-slate-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-600 dark:hover:bg-slate-500 disabled:opacity-50 transition'
          >
            {savingVisibility ? 'Guardando…' : 'Guardar visibilidad'}
          </button>
        </div>
      )}

      {/* Tabs por categoría */}
      <div className='flex gap-2 flex-wrap'>
        {availableKinds.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              kind === k
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {loading && (
        <p className='text-slate-500 dark:text-slate-400 text-sm'>Cargando…</p>
      )}

      {!loading && list.length === 0 && (
        <p className='text-slate-500 dark:text-slate-400 text-sm'>
          No hay productos en esta categoría.
        </p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={list.map((p) => p._id)} strategy={verticalListSortingStrategy}>
          <div className='space-y-2'>
            {list.map((product) => (
              <SortableRow key={product._id} product={product} onToggleVisible={handleToggleVisible} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}

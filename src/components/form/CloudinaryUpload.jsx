import { useRef, useState } from 'react';
import { inputClass } from '../../utils/formStyles';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function CloudinaryUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError('Faltan VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en el .env');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('upload_preset', UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body },
      );

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      onChange(data.secure_url);
    } catch (err) {
      setError('No se pudo subir la imagen. Revisá las credenciales de Cloudinary.');
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-2'>
        <input
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='URL de imagen (o subí un archivo)'
        />
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className='shrink-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
        >
          {uploading ? 'Subiendo…' : 'Subir'}
        </button>
        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleFile}
        />
      </div>

      {error && <p className='text-xs text-red-500'>{error}</p>}

      {value && !uploading && (
        <img
          src={value}
          alt='Preview'
          className='h-24 w-24 rounded-md border border-slate-200 object-contain dark:border-slate-700'
        />
      )}

      {uploading && (
        <div className='flex h-24 w-24 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700'>
          <span className='text-xs text-slate-400'>Subiendo…</span>
        </div>
      )}
    </div>
  );
}

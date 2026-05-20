import { useEffect, useRef, useState } from 'react';

export function useProductModal() {
  const [openItem, setOpenItem] = useState(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!openItem) return;
    const onKey = (e) => e.key === 'Escape' && setOpenItem(null);
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openItem]);

  return { openItem, setOpenItem, closeBtnRef };
}

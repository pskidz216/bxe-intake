import { useState, useEffect } from 'react';

export default function FormGrid({ children, cols = 2, gap = 16 }) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 640
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const h = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : `repeat(${cols}, 1fr)`,
      gap: isMobile ? 12 : gap,
    }}>
      {children}
    </div>
  );
}

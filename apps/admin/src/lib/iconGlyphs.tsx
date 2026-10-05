import type { ReactElement } from 'react';
import type { CategoryIcon } from './categoryIcons';

const paths: Record<CategoryIcon, ReactElement> = {
  sunglasses: (
    <>
      <path d="M2 9.5h2.2l1 5.3a3 3 0 0 0 3 2.5h1.2a3 3 0 0 0 3-2.5l.3-1.8h1l.3 1.8a3 3 0 0 0 3 2.5h1.2a3 3 0 0 0 3-2.5l1-5.3H22" />
      <path d="M4.2 9.5h15.6M9.5 9.5c1.5.2 2.5.9 2.5 2.1M14.5 9.5c-1.5.2-2.5.9-2.5 2.1" />
      <path d="M5.2 11h6l-.6 3.3a1.8 1.8 0 0 1-1.8 1.5H8a1.8 1.8 0 0 1-1.8-1.5zM12.8 11h6l-1 3.3a1.8 1.8 0 0 1-1.8 1.5h-.8a1.8 1.8 0 0 1-1.8-1.5z" fill="currentColor" stroke="none" />
    </>
  ),
  'film-outline': <><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M7 5v14M17 5v14M3 9h4M17 9h4M3 15h4M17 15h4" /></>,
  'game-controller-outline': <><path d="M7 9h2M8 8v2M15.5 10h.01M17.5 12h.01" /><path d="M6 9h12a4 4 0 0 1 4 5.5l-.5 1A3 3 0 0 1 18.7 18l-1.9-2H7.2l-1.9 2A3 3 0 0 1 2.5 15.5L2 14.5A4 4 0 0 1 6 9z" /></>,
  'musical-notes-outline': <><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /><path d="M9 18V5l11-2v13" /></>,
  'basketball-outline': <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18M4.5 6.5a13 13 0 0 0 15 0M4.5 17.5a13 13 0 0 1 15 0" /></>,
  'shapes-outline': <><circle cx="8" cy="8" r="4" /><rect x="11" y="11" width="9" height="9" rx="1.5" /></>,
};

export function CategoryIconGlyph({ icon, size = 18 }: { icon: CategoryIcon; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[icon]}</svg>;
}

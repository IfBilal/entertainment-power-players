/**
 * Small hand-rolled glyphs for the bundled category icon set (CATEGORY_ICON_OPTIONS),
 * following the same no-icon-library convention already used for the sidebar
 * glyphs in App.tsx. Keeps the admin's icon picker visual (a real grid of
 * shapes) rather than a text-only <select> (spec: icon picker should show a
 * visual grid, not a raw dropdown).
 */
import type { ReactElement } from 'react';
import type { CategoryIcon } from './categoryIcons';

const strokeProps = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const paths: Record<CategoryIcon, ReactElement> = {
  'glasses-outline': (
    <>
      <circle cx="6.5" cy="14" r="3.5" />
      <circle cx="17.5" cy="14" r="3.5" />
      <path d="M10 14h4M3 12l1.5-5h2M21 12l-1.5-5h-2" />
    </>
  ),
  'shirt-outline': <path d="M8 4l4 2 4-2 4 4-3 3v11H7V11L4 8z" />,
  'diamond-outline': <path d="M6 9h12l-6 12z M6 9L9 4h6l3 5" />,
  'film-outline': (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M7 5v14M17 5v14M3 9h4M17 9h4M3 15h4M17 15h4" />
    </>
  ),
  'videocam-outline': (
    <>
      <rect x="3" y="6" width="13" height="12" rx="1.5" />
      <path d="M16 10l5-3v10l-5-3z" />
    </>
  ),
  'tv-outline': (
    <>
      <rect x="3" y="6" width="18" height="13" rx="1.5" />
      <path d="M8 22h8M12 19v3" />
    </>
  ),
  'game-controller-outline': (
    <>
      <path d="M7 9h2M8 8v2M15.5 10h.01M17.5 12h.01" />
      <path d="M6 9h12a4 4 0 0 1 4 5.5l-.5 1A3 3 0 0 1 18.7 18l-1.9-2H7.2l-1.9 2A3 3 0 0 1 2.5 15.5L2 14.5A4 4 0 0 1 6 9z" />
    </>
  ),
  'headset-outline': (
    <>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
      <path d="M19 19v1a2 2 0 0 1-2 2h-3" />
    </>
  ),
  'planet-outline': (
    <>
      <circle cx="12" cy="12" r="5" />
      <ellipse cx="12" cy="12" rx="10" ry="3" />
    </>
  ),
  'musical-notes-outline': (
    <>
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
      <path d="M9 18V5l11-2v13" />
    </>
  ),
  'mic-outline': (
    <>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v4M9 22h6" />
    </>
  ),
  'trophy-outline': (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 5H4a3 3 0 0 0 3 5M17 5h3a3 3 0 0 1-3 5M10 19h4M12 14v5M8 22h8" />
    </>
  ),
  'american-football-outline': (
    <>
      <ellipse cx="12" cy="12" rx="9" ry="5.5" transform="rotate(-35 12 12)" />
      <path d="M8 12l8 0M9.5 10l1.4 1.5M13 10.6l1.4 1.5M9.5 14l1.4-1.5M13 13.4l1.4-1.5" />
    </>
  ),
  'basketball-outline': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18M4.5 6.5a13 13 0 0 0 15 0M4.5 17.5a13 13 0 0 1 15 0" />
    </>
  ),
  'people-outline': (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  'briefcase-outline': (
    <>
      <rect x="2" y="7" width="20" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 12h20" />
    </>
  ),
  'star-outline': <path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 6.9L12 17.8 5.7 21.1l1.2-6.9-5-4.9 7-1z" />,
  'sparkles-outline': (
    <>
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </>
  ),
};

export function CategoryIconGlyph({ icon, size = 18 }: { icon: string; size?: number }) {
  const path = paths[icon as CategoryIcon];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...strokeProps}>
      {path ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}

import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number; filled?: boolean };

function base({ size = 20, ...rest }: P, filled = false): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: filled ? 'currentColor' : 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...rest,
  };
}

const strip = ({ filled: _f, ...p }: P) => p;

export const HomeIcon = (p: P) => (
  <svg {...base(strip(p), p.filled)}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
  </svg>
);
export const PinIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" fill={p.filled ? 'currentColor' : 'none'} />
    <circle cx="12" cy="10" r="3" fill={p.filled ? 'var(--nav-active-bg)' : 'none'} stroke={p.filled ? 'var(--nav-active-bg)' : 'currentColor'} />
  </svg>
);
export const ChatIcon = (p: P) => (
  <svg {...base(strip(p), p.filled)}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
export const UserPlusIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="8.5" cy="7" r="4" fill={p.filled ? 'currentColor' : 'none'} />
    <path d="M20 8v6M23 11h-6" />
  </svg>
);
export const UserIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" fill={p.filled ? 'currentColor' : 'none'} />
    <circle cx="12" cy="7" r="4" fill={p.filled ? 'currentColor' : 'none'} />
  </svg>
);
export const LoginIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
  </svg>
);
export const LogoutIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);
export const BellIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
export const SearchIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);
export const StarIcon = (p: P) => (
  <svg {...base(strip(p), true)} strokeWidth={1}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
  </svg>
);
export const VideoIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);
export const SendIcon = (p: P) => (
  <svg {...base(strip(p), true)} strokeWidth={0}>
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);
export const PlusCircleIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);
export const PlayIcon = (p: P) => (
  <svg {...base(strip(p), true)} strokeWidth={0}>
    <path d="M8 5v14l11-7z" />
  </svg>
);
export const BackIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
export const ChevronIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
export const LockIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
export const GlobeIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);
export const SunIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);
export const SettingsIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
export const MoreIcon = (p: P) => (
  <svg {...base(strip(p), true)} strokeWidth={0}>
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);
export const SparkIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <path d="M12 3l1.9 5.8L20 10.7l-6.1 1.9L12 18.5l-1.9-5.9L4 10.7l6.1-1.9z" fill={p.filled ? 'currentColor' : 'none'} />
  </svg>
);
export const CalendarIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
export const LocateIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    <circle cx="12" cy="12" r="8" />
  </svg>
);
export const UploadIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base(strip(p))}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

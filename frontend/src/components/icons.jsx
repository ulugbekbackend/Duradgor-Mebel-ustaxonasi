/** Ustaxona uchun qo'lda chizilgan SVG ikonkalar to'plami. */
const base = (p) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...p,
});

export const IconLogo = (p) => (
  <svg width={34} height={34} viewBox="0 0 32 32" fill="none" {...p}>
    <rect width="32" height="32" rx="7" fill="#123024" />
    <path
      d="M8 13h16v6a3 3 0 0 1-3 3h-1v3h-2v-3h-4v3h-2v-3h-1a3 3 0 0 1-3-3v-6Zm2 2v4a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 22 19v-4H10Zm1-6a3 3 0 0 0-3 3v1h2v-1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1h2v-1a3 3 0 0 0-3-3H11Z"
      fill="#EAB64F"
    />
  </svg>
);

export const IconCart = (p) => (
  <svg {...base(p)}>
    <path d="M4 5h2l2.2 10.4a1.6 1.6 0 0 0 1.57 1.27h7.6a1.6 1.6 0 0 0 1.56-1.24L20.5 9H7" />
    <circle cx="10.4" cy="20" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="17.6" cy="20" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSearch = (p) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.4-4.4" />
  </svg>
);

export const IconPhone = (p) => (
  <svg {...base(p)}>
    <path d="M5.5 4h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L16 14l4 1.5v3a1.8 1.8 0 0 1-2 1.8C10.6 19.6 4.4 13.4 3.7 6a1.8 1.8 0 0 1 1.8-2Z" />
  </svg>
);

export const IconTelegram = (p) => (
  <svg {...base(p)}>
    <path d="m4 11.5 15.5-6.2c.7-.3 1.3.3 1 1L17 19c-.25.7-1.1.75-1.5.15l-2.6-4.3 5-6.2-6.6 5.4-4.6-1.4c-.8-.25-.8-1.35.3-1.15Z" />
  </svg>
);

export const IconMenu = (p) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);

export const IconClose = (p) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const IconArrow = (p) => (
  <svg {...base(p)}>
    <path d="M4 12h15m-6-6 6 6-6 6" />
  </svg>
);

export const IconPlus = (p) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconMinus = (p) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
);

export const IconTrash = (p) => (
  <svg {...base(p)}>
    <path d="M5 7h14M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7M7 7l.8 12a1.6 1.6 0 0 0 1.6 1.5h5.2a1.6 1.6 0 0 0 1.6-1.5L17 7" />
    <path d="M10.2 11v6M13.8 11v6" />
  </svg>
);

export const IconFilter = (p) => (
  <svg {...base(p)}>
    <path d="M5 6.5h14M7.5 12h9M10 17.5h4" />
  </svg>
);

export const IconChevron = (p) => (
  <svg {...base(p)}>
    <path d="m8.5 5 7 7-7 7" />
  </svg>
);

export const IconStar = (p) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2.6 14.9 8.7l6.5.8-4.8 4.5 1.3 6.4L12 17.2l-5.9 3.2 1.3-6.4L2.6 9.5l6.5-.8L12 2.6Z" />
  </svg>
);

export const IconRuler = (p) => (
  <svg {...base(p)}>
    <rect x="3" y="9" width="18" height="6" rx="1.2" />
    <path d="M7 9v3M11 9v3M15 9v3" />
  </svg>
);

export const IconHammer = (p) => (
  <svg {...base(p)}>
    <path d="m13.5 10 6.5 6.8a1.7 1.7 0 0 1-2.4 2.4l-6.7-6.6" />
    <path d="M6.3 4.2 10 3l4.5 4.4-2.8 2.7-4.9-4a1.9 1.9 0 0 1-.5-1.9Z" />
  </svg>
);

export const IconTruck = (p) => (
  <svg {...base(p)}>
    <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
    <circle cx="7" cy="17.6" r="1.7" />
    <circle cx="17.2" cy="17.6" r="1.7" />
  </svg>
);

export const IconShield = (p) => (
  <svg {...base(p)}>
    <path d="M12 3 5 5.8v5.4c0 4.3 2.9 7.6 7 9 4.1-1.4 7-4.7 7-9V5.8L12 3Z" />
    <path d="m9 11.5 2.2 2.2L15.5 9" />
  </svg>
);

export const IconCard = (p) => (
  <svg {...base(p)}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="M3 10h18M7 14.5h4" />
  </svg>
);

export const IconCheck = (p) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const IconLink = (p) => (
  <svg {...base(p)}>
    <path d="M10 14a4 4 0 0 0 6 .4l2.5-2.5a4 4 0 0 0-5.7-5.7L11.5 7.5" />
    <path d="M14 10a4 4 0 0 0-6-.4L5.5 12a4 4 0 0 0 5.7 5.7l1.3-1.3" />
  </svg>
);

export const IconFacebook = (p) => (
  <svg {...base(p)}>
    <path d="M14.5 8.5H17V5.5h-2.5A3.5 3.5 0 0 0 11 9v2H8.5v3H11v6.5h3V14h2.5l.5-3h-3V9a1 1 0 0 1 1-1Z" />
  </svg>
);

export const IconX = (p) => (
  <svg {...base(p)}>
    <path d="m5 5 14 14M19 5 5 19" />
  </svg>
);

export const IconPin = (p) => (
  <svg {...base(p)}>
    <path d="M12 21s-6.5-5.4-6.5-10.2A6.5 6.5 0 0 1 12 4.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15.6 12 21 12 21Z" />
    <circle cx="12" cy="10.7" r="2.2" />
  </svg>
);

export const IconClock = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconSofa = (p) => (
  <svg {...base(p)}>
    <path d="M5 11V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V11" />
    <path d="M3.5 13.5A2 2 0 0 1 5.5 11c1.1 0 2 .9 2 2v.5h9v-.5a2 2 0 1 1 4 0v2.5a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2v-2ZM6.5 17.5V19M17.5 17.5V19" />
  </svg>
);

export const IconBed = (p) => (
  <svg {...base(p)}>
    <path d="M4 18v-8.5M4 13h16v5M4 15.5h16M20 18v-3" />
    <path d="M6.5 13v-2a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 11.5 11v2" />
  </svg>
);

export const IconPot = (p) => (
  <svg {...base(p)}>
    <path d="M5 11h14v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-5ZM3.5 11h17" />
    <path d="M9 8c0-1.2 1-1.3 1-2.5M13.5 8c0-1.2 1-1.3 1-2.5" />
  </svg>
);

export const IconDesk = (p) => (
  <svg {...base(p)}>
    <path d="M3.5 9h17M5.5 9v9M18.5 9v9M14 9v5.5h4.5" />
    <path d="M15.8 11.7h1" />
  </svg>
);

export const IconSpark = (p) => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2c.6 4.8 2.2 6.6 7 7.3v1.4c-4.8.7-6.4 2.5-7 7.3h-1.4c-.6-4.8-2.2-6.6-7-7.3V9.3c4.8-.7 6.4-2.5 7-7.3H12Z" />
  </svg>
);

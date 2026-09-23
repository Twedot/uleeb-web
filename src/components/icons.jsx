// Minimal inline icon set matching what the auth/onboarding screens
// need — same strokes/shapes as the mobile app's components/icons.tsx.

export function ChevronLeftIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function PhoneIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function HomeIcon({ size = 22, color = 'currentColor', strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5Z" />
    </svg>
  );
}

export function KeyIcon({ size = 22, color = 'currentColor', strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="15" r="4" />
      <path d="M10.85 12.15 19 4l2 2-2 2 1.5 1.5-2 2L17 10l-4.15 4.15" />
    </svg>
  );
}

export function PinIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// Everything below mirrors the mobile app's own components/icons.tsx exactly
// (same viewBox/path data) — the swipe/properties/profile screens need these.

export function XIcon({ size = 20, color = 'currentColor', strokeWidth = 2.2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function HeartIcon({ size = 20, color = '#FFFFFF' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 21s-7.5-4.6-10-9.3C.5 8.2 2.4 5 6 5c2 0 3.4 1 4.5 2.4C11.6 6 13 5 15 5c3.6 0 5.5 3.2 4 6.7C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

export function BookmarkIcon({ size = 18, color = 'currentColor', strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round">
      <path d="M6 4h12v16l-6-4-6 4V4z" />
    </svg>
  );
}

export function CheckIcon({ size = 14, color = '#2F8F55', strokeWidth = 2.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 16, color = 'currentColor', strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function FilterIcon({ size = 17, color = 'currentColor', strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

export function CompassIcon({ size = 22, color = 'currentColor', strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 6-6 2 2-6 6-2z" />
    </svg>
  );
}

export function InboxIcon({ size = 22, color = 'currentColor', strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round">
      <path d="M4 13h4l1.5 3h5L16 13h4" />
      <path d="M4 13V7a2 2 0 012-2h12a2 2 0 012 2v6" />
      <path d="M4 13v5a2 2 0 002 2h12a2 2 0 002-2v-5" />
    </svg>
  );
}

export function PersonIcon({ size = 22, color = 'currentColor', strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5" strokeLinecap="round" />
    </svg>
  );
}

export function PlayIcon({ size = 14, color = '#FFFFFF' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

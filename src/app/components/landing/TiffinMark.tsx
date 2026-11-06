// 4-tier tiffin wordmark icon. Shared by the header logo and the F6 colophon
// so the mark stays in one place (DESIGN.md: flat vector, 2px ink outline).

interface TiffinMarkProps {
  className?: string;
}

export default function TiffinMark({ className }: TiffinMarkProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 28"
      aria-hidden="true"
    >
      <path d="M12 2 C8 2 8 5 8 5 L16 5 C16 5 16 2 12 2 Z" />
      <rect x="5" y="6" width="14" height="4" rx="1" />
      <rect x="5" y="11" width="14" height="4" rx="1" />
      <rect x="5" y="16" width="14" height="4" rx="1" />
      <rect x="5" y="21" width="14" height="5" rx="1" />
      <line x1="19" y1="6" x2="19" y2="25" strokeDasharray="1 1" />
      <line x1="5" y1="6" x2="5" y2="25" strokeDasharray="1 1" />
    </svg>
  );
}

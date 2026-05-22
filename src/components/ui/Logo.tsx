// NebenkostenCheck Logo SVG
export function Logo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NebenkostenCheck Logo"
    >
      {/* Haus-Form */}
      <path
        d="M5 18L20 5L35 18V36H26V26H14V36H5V18Z"
        fill="var(--primary)"
        stroke="var(--primary-dark)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Checkmark */}
      <path
        d="M13 22L18 27L27 17"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

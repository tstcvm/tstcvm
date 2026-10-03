export default function Logo({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="TSTCVM">
      <circle cx="32" cy="32" r="30" fill="var(--crimson)" />
      <circle cx="32" cy="32" r="30" fill="none" stroke="var(--gold)" strokeWidth="2" />
      {/* หยินหยาง */}
      <path
        d="M32 12a20 20 0 0 0 0 40 10 10 0 0 1 0-20 10 10 0 0 0 0-20Z"
        fill="#faf7f2"
      />
      <circle cx="32" cy="22" r="3.2" fill="var(--crimson)" />
      <circle cx="32" cy="42" r="3.2" fill="#faf7f2" />
      <path d="M32 12a20 20 0 0 1 0 40" fill="var(--crimson)" />
      {/* เข็ม */}
      <path d="M46 18 L58 6" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="58" cy="6" r="3" fill="var(--gold)" />
    </svg>
  )
}

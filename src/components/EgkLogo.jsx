export default function EgkLogo({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M50 18 C35 18 24 30 24 46 L24 62 L28 62 L28 70 L34 70 L34 78 L66 78 L66 70 L72 70 L72 62 L76 62 L76 46 C76 30 65 18 50 18 Z"
        fill="none"
        stroke="var(--egk-text-secondary)"
        strokeWidth="2"
      />
      <circle cx="40" cy="46" r="4" fill="var(--egk-text-primary)" />
      <circle cx="60" cy="46" r="4" fill="var(--egk-text-primary)" />
      <path
        d="M30 20 Q22 30 26 44 M70 20 Q78 30 74 44"
        fill="none"
        stroke="var(--egk-accent)"
        strokeWidth="1.5"
      />
    </svg>
  )
}

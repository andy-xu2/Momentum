export default function BrandMark({ size = 'md' }) {
  return (
    <div className={`brand-mark-row brand-${size}`}>
      <span className="brand-mark-glyph" aria-hidden>
        <svg viewBox="0 0 64 64" fill="none">
          <circle
            cx="32"
            cy="32"
            r="26"
            stroke="#7a3f8a"
            strokeWidth="5"
            fill="none"
          />
          <path
            d="M36 8 L18 36 H30 L26 56 L48 26 H34 L40 8 Z"
            fill="#7a3f8a"
          />
        </svg>
      </span>
      <span className="brand-text">Momentum</span>
    </div>
  )
}

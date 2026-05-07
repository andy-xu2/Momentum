import {
  BURNOUT_COLOR_HEX,
  BURNOUT_THRESHOLDS,
  burnoutColorForScore,
} from '../constants.js'

export default function BurnoutDial({ score }) {
  const clamped = Math.max(0, Math.min(100, score))
  const ratio = clamped / 100
  const angleDeg = 180 + ratio * 180
  const rad = (angleDeg * Math.PI) / 180
  const tipX = 100 + 70 * Math.cos(rad)
  const tipY = 100 + 70 * Math.sin(rad)

  const colorName = burnoutColorForScore(clamped)
  const colorHex = BURNOUT_COLOR_HEX[colorName]

  const yellowStart = `${BURNOUT_THRESHOLDS.yellow}%`
  const redStart = `${BURNOUT_THRESHOLDS.red}%`

  return (
    <div className="burnout-dial" aria-label="Burnout score gauge">
      <svg viewBox="0 0 200 130" width="180" height="118">
        <defs>
          <linearGradient id="burnoutBg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={BURNOUT_COLOR_HEX.Green} />
            <stop offset={yellowStart} stopColor={BURNOUT_COLOR_HEX.Green} />
            <stop offset={yellowStart} stopColor={BURNOUT_COLOR_HEX.Yellow} />
            <stop offset={redStart} stopColor={BURNOUT_COLOR_HEX.Yellow} />
            <stop offset={redStart} stopColor={BURNOUT_COLOR_HEX.Red} />
            <stop offset="100%" stopColor={BURNOUT_COLOR_HEX.Red} />
          </linearGradient>
        </defs>
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          stroke="url(#burnoutBg)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
        <line
          x1="100"
          y1="100"
          x2={tipX}
          y2={tipY}
          stroke="#1a1a1f"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="5" fill="#1a1a1f" />
      </svg>
      <div className="burnout-meta">
        <span className="burnout-caption">Burnout</span>
        <span className="burnout-label" style={{ color: colorHex }}>
          {colorName}
        </span>
        <span className="burnout-score mono">{clamped} / 100</span>
      </div>
    </div>
  )
}

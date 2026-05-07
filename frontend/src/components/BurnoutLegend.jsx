import { BURNOUT_BANDS } from '../constants.js'

export default function BurnoutLegend({ compact = false }) {
  return (
    <div className={`legend burnout-legend ${compact ? 'legend-compact' : ''}`}>
      <span className="legend-title">Burnout Score</span>
      <div className="legend-items">
        {BURNOUT_BANDS.map((band) => (
          <span key={band.color} className="legend-item">
            <span
              className="legend-swatch"
              style={{ background: band.hex }}
              aria-hidden="true"
            />
            {band.color}: {band.label}
          </span>
        ))}
      </div>
    </div>
  )
}

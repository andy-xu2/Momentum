import { CATEGORY_COLORS } from '../constants.js'

const ORDER = ['class', 'study', 'health', 'social', 'rest', 'personal']

export default function CategoryList() {
  return (
    <div className="category-list">
      <div className="sidebar-section-title">Categories</div>
      <div className="category-rows">
        {ORDER.map((id) => {
          const c = CATEGORY_COLORS[id]
          return (
            <div key={id} className="category-row">
              <span
                className="category-dot"
                style={{ background: c.bar }}
                aria-hidden
              />
              <span className="category-label">{c.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

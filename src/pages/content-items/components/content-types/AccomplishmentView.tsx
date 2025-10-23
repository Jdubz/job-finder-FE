import React from "react"
import type { AccomplishmentItem } from "../../../../types/content-items"

interface AccomplishmentViewProps {
  item: AccomplishmentItem
}

export const AccomplishmentView: React.FC<AccomplishmentViewProps> = ({ item }) => {
  return (
    <div>
      {/* Date */}
      {item.date && <p className="text-sm text-muted-foreground mb-2">{item.date}</p>}

      {/* Description */}
      <p className="text-base mb-2 leading-relaxed">{item.description}</p>

      {/* Context */}
      {item.context && <p className="text-sm text-muted-foreground italic mb-2">{item.context}</p>}

      {/* Impact */}
      {item.impact && (
        <div className="mb-2">
          <span className="text-sm font-bold text-muted-foreground mr-1">Impact:</span>
          <span className="text-sm text-muted-foreground">{item.impact}</span>
        </div>
      )}

      {/* Technologies */}
      {item.technologies && item.technologies.length > 0 && (
        <div>
          <span className="text-sm font-bold text-muted-foreground mr-2">Technologies:</span>
          <span className="text-sm text-muted-foreground">{item.technologies.join(", ")}</span>
        </div>
      )}
    </div>
  )
}

import React from "react"
import type { SkillGroupItem } from "../../../../types/content-items"

interface SkillGroupViewProps {
  item: SkillGroupItem
}

export const SkillGroupView: React.FC<SkillGroupViewProps> = ({ item }) => {
  return (
    <div>
      {/* Category */}
      <h3 className="text-lg font-bold mb-3">
        {item.category}
      </h3>

      {/* Skills */}
      <div className="mb-4">
        <span className="text-base text-foreground">
          {item.skills.join(", ")}
        </span>
      </div>

      {/* Subcategories */}
      {item.subcategories && item.subcategories.length > 0 && (
        <div className="space-y-3">
          {item.subcategories.map((subcategory, idx) => (
            <div key={idx}>
              <p className="text-sm font-bold text-muted-foreground mb-1">
                {subcategory.name}:
              </p>
              <p className="text-base">
                {subcategory.skills.join(", ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

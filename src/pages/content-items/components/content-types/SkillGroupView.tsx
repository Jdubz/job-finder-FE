import React from "react"
import type { SkillGroupItem } from "../../../../types/content-items"
import { Badge } from "../../../../components/ui/badge"
import { Code2 } from "lucide-react"
import { Separator } from "../../../../components/ui/separator"

interface SkillGroupViewProps {
  item: SkillGroupItem
}

export const SkillGroupView: React.FC<SkillGroupViewProps> = ({ item }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Code2 className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">{item.category}</h3>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1">
        {item.skills.map((skill) => (
          <Badge key={skill} variant="default" className="text-xs">
            {skill}
          </Badge>
        ))}
      </div>

      {/* Subcategories */}
      {item.subcategories && item.subcategories.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            {item.subcategories.map((subcategory, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">{subcategory.name}</h4>
                <div className="flex flex-wrap gap-1">
                  {subcategory.skills?.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

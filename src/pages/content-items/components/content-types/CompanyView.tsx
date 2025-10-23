import React from "react"
import type { CompanyItem } from "../../../../types/content-items"
import { formatMonthYear } from "../../../../utils/dateFormat"
import { Badge } from "../../../../components/ui/badge"
import { Building2, MapPin, Calendar, ExternalLink } from "lucide-react"
import { Separator } from "../../../../components/ui/separator"

interface CompanyViewProps {
  item: CompanyItem
}

export const CompanyView: React.FC<CompanyViewProps> = ({ item }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">{item.company}</h3>
          {item.website && (
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {item.role && <p className="text-base font-medium text-muted-foreground">{item.role}</p>}

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {formatMonthYear(item.startDate)} –{" "}
              {item.endDate ? formatMonthYear(item.endDate) : "Present"}
            </span>
          </div>
          {item.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{item.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {item.summary && (
        <>
          <Separator />
          <p className="text-sm leading-relaxed text-muted-foreground">{item.summary}</p>
        </>
      )}

      {/* Accomplishments */}
      {item.accomplishments && item.accomplishments.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Accomplishments</h4>
            <ul className="space-y-2 list-disc list-inside">
              {item.accomplishments.map((accomplishment, idx) => (
                <li key={idx} className="text-sm text-muted-foreground leading-relaxed">
                  {accomplishment}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Technologies */}
      {item.technologies && item.technologies.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Technologies</h4>
            <div className="flex flex-wrap gap-1">
              {item.technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

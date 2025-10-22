import React from "react"
import type { ProjectItem } from "../../../../types/content-items"
import { formatMonthYear } from "../../../../utils/dateFormat"
import { Badge } from "../../../../components/ui/badge"
import { Folder, Calendar, ExternalLink } from "lucide-react"

interface ProjectViewProps {
  item: ProjectItem
}

export const ProjectView: React.FC<ProjectViewProps> = ({ item }) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-primary" />
          <h4 className="text-base font-semibold">{item.name}</h4>
        </div>

        {item.role && <p className="text-sm text-muted-foreground italic">{item.role}</p>}

        {item.startDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {formatMonthYear(item.startDate)} – {item.endDate ? formatMonthYear(item.endDate) : "Present"}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>

      {/* Context */}
      {item.context && (
        <p className="text-xs italic text-muted-foreground border-l-2 pl-2 border-muted">{item.context}</p>
      )}

      {/* Accomplishments */}
      {item.accomplishments && item.accomplishments.length > 0 && (
        <div className="space-y-1">
          <h5 className="text-xs font-medium">Accomplishments</h5>
          <ul className="space-y-1 list-disc list-inside">
            {item.accomplishments.map((accomplishment, idx) => (
              <li key={idx} className="text-xs text-muted-foreground leading-relaxed">
                {accomplishment}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Challenges */}
      {item.challenges && item.challenges.length > 0 && (
        <div className="space-y-1">
          <h5 className="text-xs font-medium">Challenges</h5>
          <ul className="space-y-1 list-disc list-inside">
            {item.challenges.map((challenge, idx) => (
              <li key={idx} className="text-xs text-muted-foreground leading-relaxed">
                {challenge}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technologies */}
      {item.technologies && item.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.technologies.map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      )}

      {/* Links */}
      {item.links && item.links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              {link.label}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

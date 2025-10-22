import React from "react"
import type { ProjectItem } from "../../../../types/content-items"
import { formatMonthYear } from "../../../../utils/dateFormat"

interface ProjectViewProps {
  item: ProjectItem
}

export const ProjectView: React.FC<ProjectViewProps> = ({ item }) => {
  return (
    <div>
      {/* Date Range (if provided) */}
      {item.startDate && (
        <p className="text-sm font-bold text-primary uppercase tracking-wide mb-2">
          {formatMonthYear(item.startDate)} – {formatMonthYear(item.endDate)}
        </p>
      )}

      {/* Project Name */}
      <h3 className="text-xl md:text-2xl font-bold mb-2">
        {item.name}
      </h3>

      {/* Role */}
      {item.role && (
        <p className="text-sm text-muted-foreground italic mb-3">
          {item.role}
        </p>
      )}

      {/* Description */}
      <p className="text-base mb-3 leading-relaxed">
        {item.description}
      </p>

      {/* Context */}
      {item.context && (
        <p className="text-sm text-muted-foreground italic mb-3">
          {item.context}
        </p>
      )}

      {/* Accomplishments */}
      {item.accomplishments && item.accomplishments.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-bold text-muted-foreground mb-1">Accomplishments:</p>
          <ul className="pl-5 m-0 list-disc">
            {item.accomplishments.map((accomplishment, idx) => (
              <li key={idx} className="mb-2 leading-relaxed">
                <span className="text-base">{accomplishment}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Challenges */}
      {item.challenges && item.challenges.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-bold text-muted-foreground mb-1">Challenges:</p>
          <ul className="pl-5 m-0 list-disc">
            {item.challenges.map((challenge, idx) => (
              <li key={idx} className="mb-2 leading-relaxed">
                <span className="text-base">{challenge}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technologies */}
      {item.technologies && item.technologies.length > 0 && (
        <div className="mb-4">
          <span className="text-sm font-bold text-muted-foreground mr-2">
            Technologies:
          </span>
          <span className="text-sm text-muted-foreground">
            {item.technologies.join(", ")}
          </span>
        </div>
      )}

      {/* Links */}
      {item.links && item.links.length > 0 && (
        <div className="mt-2">
          {item.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-primary mr-3 no-underline hover:underline"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

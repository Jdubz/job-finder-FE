import React from "react"
import type { CompanyItem } from "../../../../types/content-items"
import { formatMonthYear } from "../../../../utils/dateFormat"

interface CompanyViewProps {
  item: CompanyItem
}

export const CompanyView: React.FC<CompanyViewProps> = ({ item }) => {
  return (
    <div>
      {/* Date Range */}
      <p className="text-sm font-bold text-primary uppercase tracking-wide mb-2">
        {formatMonthYear(item.startDate)} – {formatMonthYear(item.endDate)}
      </p>

      {/* Company Name */}
      <h2 className="text-2xl md:text-3xl font-bold mb-2">
        {item.company}
      </h2>

      {/* Location */}
      {item.location && (
        <p className="text-sm text-muted-foreground mb-2">
          {item.location}
        </p>
      )}

      {/* Role */}
      {item.role && (
        <p className="text-base text-muted-foreground italic mb-3">
          {item.role}
        </p>
      )}

      {/* Summary */}
      {item.summary && (
        <p className="text-base mb-3 leading-relaxed">
          {item.summary}
        </p>
      )}

      {/* Accomplishments */}
      {item.accomplishments && item.accomplishments.length > 0 && (
        <div className="mb-4">
          <ul className="pl-5 m-0 list-disc">
            {item.accomplishments.map((accomplishment, idx) => (
              <li
                key={idx}
                className="mb-3 leading-relaxed"
              >
                <span className="text-base">{accomplishment}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technologies */}
      {item.technologies && item.technologies.length > 0 && (
        <div className="mb-4">
          <span className="text-sm font-bold text-muted-foreground mr-2">
            Skills:
          </span>
          <span className="text-sm text-muted-foreground">
            {item.technologies.join(", ")}
          </span>
        </div>
      )}

      {/* Website */}
      {item.website && (
        <div className="mb-2">
          <a
            href={item.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary no-underline hover:underline"
          >
            {item.website}
          </a>
        </div>
      )}
    </div>
  )
}

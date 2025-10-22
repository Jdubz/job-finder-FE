import React from "react"
import type { EducationItem } from "../../../../types/content-items"
import { formatMonthYear } from "../../../../utils/dateFormat"

interface EducationViewProps {
  item: EducationItem
}

export const EducationView: React.FC<EducationViewProps> = ({ item }) => {
  return (
    <div>
      {/* Date Range */}
      {item.startDate && (
        <p className="text-sm font-bold text-primary uppercase tracking-wide mb-2">
          {formatMonthYear(item.startDate)} – {formatMonthYear(item.endDate)}
        </p>
      )}

      {/* Institution */}
      <h3 className="text-xl md:text-2xl font-bold mb-2">
        {item.institution}
      </h3>

      {/* Location */}
      {item.location && (
        <p className="text-sm text-muted-foreground mb-2">
          {item.location}
        </p>
      )}

      {/* Degree and Field */}
      {(item.degree || item.field) && (
        <p className="text-base mb-2">
          {item.degree}
          {item.degree && item.field && ", "}
          {item.field}
        </p>
      )}

      {/* Honors */}
      {item.honors && (
        <p className="text-sm text-muted-foreground italic mb-2">
          {item.honors}
        </p>
      )}

      {/* Description */}
      {item.description && (
        <p className="text-base mb-3 leading-relaxed">
          {item.description}
        </p>
      )}

      {/* Relevant Courses */}
      {item.relevantCourses && item.relevantCourses.length > 0 && (
        <div className="mb-3">
          <span className="text-sm font-bold text-muted-foreground mr-2">
            Relevant Courses:
          </span>
          <span className="text-sm text-muted-foreground">
            {item.relevantCourses.join(", ")}
          </span>
        </div>
      )}

      {/* Credential */}
      {item.credentialUrl && (
        <div className="mb-2">
          <a
            href={item.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary no-underline hover:underline"
          >
            View Credential
            {item.credentialId && ` (${item.credentialId})`}
          </a>
        </div>
      )}
    </div>
  )
}

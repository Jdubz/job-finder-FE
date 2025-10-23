import React from "react"
import type { TimelineEventItem } from "../../../../types/content-items"

interface TimelineEventViewProps {
  item: TimelineEventItem
}

export const TimelineEventView: React.FC<TimelineEventViewProps> = ({ item }) => {
  return (
    <div>
      {/* Date or Date Range */}
      {(item.date || item.dateRange) && (
        <p className="text-sm text-muted-foreground font-bold mb-2">
          {item.date || item.dateRange}
        </p>
      )}

      {/* Title */}
      <h3 className="text-lg md:text-xl font-bold mb-2">
        {item.title}
      </h3>

      {/* Description */}
      {item.description && (
        <p className="text-base mb-2 leading-relaxed">
          {item.description}
        </p>
      )}

      {/* Details */}
      {item.details && (
        <p className="text-sm mb-2 text-muted-foreground leading-relaxed">
          {item.details}
        </p>
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

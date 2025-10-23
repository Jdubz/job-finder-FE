import React from "react"
import type { ProfileSectionItem } from "../../../../types/content-items"

interface ProfileSectionViewProps {
  item: ProfileSectionItem
}

export const ProfileSectionView: React.FC<ProfileSectionViewProps> = ({ item }) => {
  return (
    <div>
      {/* Heading */}
      <h2 className="text-2xl md:text-3xl font-bold mb-3">{item.heading}</h2>

      {/* Structured Data (if available) */}
      {item.structuredData && (
        <div className="space-y-2 mb-4">
          {item.structuredData.name && (
            <p className="text-xl font-bold">{item.structuredData.name}</p>
          )}
          {item.structuredData.tagline && (
            <p className="text-base text-muted-foreground italic">{item.structuredData.tagline}</p>
          )}
          {item.structuredData.role && <p className="text-base">{item.structuredData.role}</p>}
          {item.structuredData.summary && (
            <p className="text-base leading-relaxed">{item.structuredData.summary}</p>
          )}
          {item.structuredData.primaryStack && item.structuredData.primaryStack.length > 0 && (
            <div>
              <span className="text-sm font-bold text-muted-foreground mr-2">Primary Stack:</span>
              <span className="text-sm text-muted-foreground">
                {item.structuredData.primaryStack.join(", ")}
              </span>
            </div>
          )}
          {item.structuredData.links && item.structuredData.links.length > 0 && (
            <div className="mt-2 flex gap-3">
              {item.structuredData.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary no-underline hover:underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content (fallback or additional content) */}
      {item.content && (
        <div className="text-base leading-relaxed whitespace-pre-wrap">{item.content}</div>
      )}
    </div>
  )
}

import React from "react"
import type { TextSectionItem } from "../../../../types/content-items"

interface TextSectionViewProps {
  item: TextSectionItem
}

export const TextSectionView: React.FC<TextSectionViewProps> = ({ item }) => {
  const renderContent = () => {
    if (item.format === "html") {
      return <div dangerouslySetInnerHTML={{ __html: item.content }} />
    } else if (item.format === "markdown") {
      // For now, just render as plain text
      // TODO: Add markdown parser if needed
      return <div className="whitespace-pre-wrap">{item.content}</div>
    } else {
      return <div className="whitespace-pre-wrap">{item.content}</div>
    }
  }

  return (
    <div>
      {/* Heading */}
      {item.heading && <h3 className="text-xl md:text-2xl font-bold mb-3">{item.heading}</h3>}

      {/* Content */}
      <div className="text-base leading-relaxed">{renderContent()}</div>
    </div>
  )
}

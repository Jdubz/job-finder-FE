import React from "react"
import type {
  UpdateContentItemData,
  UpdateTimelineEventData,
} from "../../../../types/content-items"
import { FormField } from "../FormField"

interface TimelineEventEditProps {
  data: UpdateContentItemData
  onChange: (data: UpdateContentItemData) => void
}

export const TimelineEventEdit: React.FC<TimelineEventEditProps> = ({ data, onChange }) => {
  const timelineEventData = data as UpdateTimelineEventData

  return (
    <div className="flex flex-col gap-4 mb-3">
      <FormField
        label="Title"
        name="title"
        value={timelineEventData.title ?? ""}
        onChange={(value) => onChange({ ...timelineEventData, title: value })}
        required
      />

      <FormField
        label="Date"
        name="date"
        value={timelineEventData.date ?? ""}
        onChange={(value) => onChange({ ...timelineEventData, date: value })}
        placeholder="2024 or leave empty for date range"
      />

      <FormField
        label="Date Range"
        name="dateRange"
        value={timelineEventData.dateRange ?? ""}
        onChange={(value) => onChange({ ...timelineEventData, dateRange: value })}
        placeholder="Jan 2024 - Present"
      />

      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={timelineEventData.description ?? ""}
        onChange={(value) => onChange({ ...timelineEventData, description: value })}
        rows={4}
      />

      <FormField
        label="Details"
        name="details"
        type="textarea"
        value={timelineEventData.details ?? ""}
        onChange={(value) => onChange({ ...timelineEventData, details: value })}
        rows={3}
      />
    </div>
  )
}

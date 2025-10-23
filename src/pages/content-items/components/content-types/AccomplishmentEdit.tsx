import React from "react"
import type {
  UpdateContentItemData,
  UpdateAccomplishmentData,
} from "../../../../types/content-items"
import { FormField } from "../FormField"

interface AccomplishmentEditProps {
  data: UpdateContentItemData
  onChange: (data: UpdateContentItemData) => void
}

export const AccomplishmentEdit: React.FC<AccomplishmentEditProps> = ({ data, onChange }) => {
  const accomplishmentData = data as UpdateAccomplishmentData

  return (
    <div className="flex flex-col gap-4 mb-3">
      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={accomplishmentData.description ?? ""}
        onChange={(value) => onChange({ ...accomplishmentData, description: value })}
        rows={3}
        required
      />

      <FormField
        label="Date"
        name="date"
        value={accomplishmentData.date ?? ""}
        onChange={(value) => onChange({ ...accomplishmentData, date: value })}
        placeholder="2024"
      />

      <FormField
        label="Context"
        name="context"
        type="textarea"
        value={accomplishmentData.context ?? ""}
        onChange={(value) => onChange({ ...accomplishmentData, context: value })}
        rows={2}
      />

      <FormField
        label="Impact"
        name="impact"
        value={accomplishmentData.impact ?? ""}
        onChange={(value) => onChange({ ...accomplishmentData, impact: value })}
      />

      <FormField
        label="Technologies (comma-separated)"
        name="technologies"
        value={accomplishmentData.technologies?.join(", ") ?? ""}
        onChange={(value) =>
          onChange({
            ...accomplishmentData,
            technologies: value
              ? value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [],
          })
        }
      />
    </div>
  )
}

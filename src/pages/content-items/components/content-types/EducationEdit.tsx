import React from "react"
import type { UpdateContentItemData, UpdateEducationData } from "../../../../types/content-items"
import { FormField } from "../FormField"

interface EducationEditProps {
  data: UpdateContentItemData
  onChange: (data: UpdateContentItemData) => void
}

export const EducationEdit: React.FC<EducationEditProps> = ({ data, onChange }) => {
  const educationData = data as UpdateEducationData

  return (
    <div className="flex flex-col gap-4 mb-3">
      <FormField
        label="Institution"
        name="institution"
        value={educationData.institution ?? ""}
        onChange={(value) => onChange({ ...educationData, institution: value })}
        required
      />

      <FormField
        label="Degree"
        name="degree"
        value={educationData.degree ?? ""}
        onChange={(value) => onChange({ ...educationData, degree: value })}
        placeholder="Bachelor of Science"
      />

      <FormField
        label="Field of Study"
        name="field"
        value={educationData.field ?? ""}
        onChange={(value) => onChange({ ...educationData, field: value })}
        placeholder="Computer Science"
      />

      <FormField
        label="Location"
        name="location"
        value={educationData.location ?? ""}
        onChange={(value) => onChange({ ...educationData, location: value })}
        placeholder="Portland, OR"
      />

      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1">
          <FormField
            label="Start Date"
            name="startDate"
            type="month"
            value={educationData.startDate ?? ""}
            onChange={(value) => onChange({ ...educationData, startDate: value })}
          />
        </div>
        <div className="flex-1">
          <FormField
            label="End Date"
            name="endDate"
            type="month"
            value={educationData.endDate ?? ""}
            onChange={(value) => onChange({ ...educationData, endDate: value || null })}
          />
        </div>
      </div>

      <FormField
        label="Honors"
        name="honors"
        value={educationData.honors ?? ""}
        onChange={(value) => onChange({ ...educationData, honors: value })}
        placeholder="Magna Cum Laude, Dean's List"
      />

      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={educationData.description ?? ""}
        onChange={(value) => onChange({ ...educationData, description: value })}
        rows={3}
      />
    </div>
  )
}

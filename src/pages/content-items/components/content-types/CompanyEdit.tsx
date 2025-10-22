import React from "react"
import type { UpdateContentItemData, UpdateCompanyData } from "../../../../types/content-items"
import { FormField } from "../FormField"

interface CompanyEditProps {
  data: UpdateContentItemData
  onChange: (data: UpdateContentItemData) => void
}

export const CompanyEdit: React.FC<CompanyEditProps> = ({ data, onChange }) => {
  // Cast to specific type - safe because parent component ensures correct type
  const companyData = data as UpdateCompanyData

  return (
    <div className="flex flex-col gap-4 mb-3">
      <FormField
        label="Company Name"
        name="company"
        value={companyData.company ?? ""}
        onChange={(value) => onChange({ ...companyData, company: value })}
        required
      />

      <FormField
        label="Role"
        name="role"
        value={companyData.role ?? ""}
        onChange={(value) => onChange({ ...companyData, role: value })}
        placeholder="Senior Developer, Lead Engineer, etc."
      />

      <FormField
        label="Location"
        name="location"
        value={companyData.location ?? ""}
        onChange={(value) => onChange({ ...companyData, location: value })}
        placeholder="Portland, OR · Remote"
      />

      <FormField
        label="Website"
        name="website"
        type="url"
        value={companyData.website ?? ""}
        onChange={(value) => onChange({ ...companyData, website: value })}
        placeholder="https://example.com"
      />

      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1">
          <FormField
            label="Start Date"
            name="startDate"
            type="month"
            value={companyData.startDate ?? ""}
            onChange={(value) => onChange({ ...companyData, startDate: value })}
            required
          />
        </div>
        <div className="flex-1">
          <FormField
            label="End Date (leave empty for Present)"
            name="endDate"
            type="month"
            value={companyData.endDate ?? ""}
            onChange={(value) => onChange({ ...companyData, endDate: value || null })}
            placeholder="Leave empty for Present"
          />
        </div>
      </div>

      <FormField
        label="Summary"
        name="summary"
        type="textarea"
        value={companyData.summary ?? ""}
        onChange={(value) => onChange({ ...companyData, summary: value })}
        rows={4}
        placeholder="Brief overview of your role and responsibilities..."
      />

      <FormField
        label="Accomplishments (one per line)"
        name="accomplishments"
        type="textarea"
        value={companyData.accomplishments?.join("\n") ?? ""}
        onChange={(value) =>
          onChange({
            ...companyData,
            accomplishments: value ? value.split("\n").filter((line) => line.trim()) : [],
          })
        }
        rows={6}
        placeholder="Led team of 5 developers&#10;Increased performance by 40%&#10;Implemented CI/CD pipeline"
      />

      <FormField
        label="Technologies (comma-separated)"
        name="technologies"
        value={companyData.technologies?.join(", ") ?? ""}
        onChange={(value) =>
          onChange({
            ...companyData,
            technologies: value ? value.split(",").map((t) => t.trim()).filter(Boolean) : [],
          })
        }
        placeholder="React, TypeScript, Node.js, PostgreSQL"
      />

      <FormField
        label="Notes (internal)"
        name="notes"
        type="textarea"
        value={companyData.notes ?? ""}
        onChange={(value) => onChange({ ...companyData, notes: value })}
        rows={2}
      />
    </div>
  )
}

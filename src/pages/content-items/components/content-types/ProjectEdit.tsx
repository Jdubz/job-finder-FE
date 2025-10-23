import React from "react"
import type { UpdateContentItemData, UpdateProjectData } from "../../../../types/content-items"
import { FormField } from "../FormField"

interface ProjectEditProps {
  data: UpdateContentItemData
  onChange: (data: UpdateContentItemData) => void
}

export const ProjectEdit: React.FC<ProjectEditProps> = ({ data, onChange }) => {
  const projectData = data as UpdateProjectData

  return (
    <div className="flex flex-col gap-4 mb-3">
      <FormField
        label="Project Name"
        name="name"
        value={projectData.name ?? ""}
        onChange={(value) => onChange({ ...projectData, name: value })}
        required
      />

      <FormField
        label="Role"
        name="role"
        value={projectData.role ?? ""}
        onChange={(value) => onChange({ ...projectData, role: value })}
        placeholder="Lead Developer, Contributor, etc."
      />

      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1">
          <FormField
            label="Start Date"
            name="startDate"
            type="month"
            value={projectData.startDate ?? ""}
            onChange={(value) => onChange({ ...projectData, startDate: value })}
          />
        </div>
        <div className="flex-1">
          <FormField
            label="End Date"
            name="endDate"
            type="month"
            value={projectData.endDate ?? ""}
            onChange={(value) => onChange({ ...projectData, endDate: value || null })}
          />
        </div>
      </div>

      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={projectData.description ?? ""}
        onChange={(value) => onChange({ ...projectData, description: value })}
        rows={4}
        placeholder="Brief description of the project..."
        required
      />

      <FormField
        label="Context"
        name="context"
        type="textarea"
        value={projectData.context ?? ""}
        onChange={(value) => onChange({ ...projectData, context: value })}
        rows={2}
        placeholder="Additional context or background..."
      />

      <FormField
        label="Accomplishments (one per line)"
        name="accomplishments"
        type="textarea"
        value={projectData.accomplishments?.join("\n") ?? ""}
        onChange={(value) =>
          onChange({
            ...projectData,
            accomplishments: value ? value.split("\n").filter((line) => line.trim()) : [],
          })
        }
        rows={4}
      />

      <FormField
        label="Challenges (one per line)"
        name="challenges"
        type="textarea"
        value={projectData.challenges?.join("\n") ?? ""}
        onChange={(value) =>
          onChange({
            ...projectData,
            challenges: value ? value.split("\n").filter((line) => line.trim()) : [],
          })
        }
        rows={4}
      />

      <FormField
        label="Technologies (comma-separated)"
        name="technologies"
        value={projectData.technologies?.join(", ") ?? ""}
        onChange={(value) =>
          onChange({
            ...projectData,
            technologies: value
              ? value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [],
          })
        }
        placeholder="React, Node.js, MongoDB"
      />
    </div>
  )
}

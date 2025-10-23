import React from "react"
import type { UpdateContentItemData, UpdateSkillGroupData } from "../../../../types/content-items"
import { FormField } from "../FormField"

interface SkillGroupEditProps {
  data: UpdateContentItemData
  onChange: (data: UpdateContentItemData) => void
}

export const SkillGroupEdit: React.FC<SkillGroupEditProps> = ({ data, onChange }) => {
  const skillGroupData = data as UpdateSkillGroupData

  return (
    <div className="flex flex-col gap-4 mb-3">
      <FormField
        label="Category"
        name="category"
        value={skillGroupData.category ?? ""}
        onChange={(value) => onChange({ ...skillGroupData, category: value })}
        required
        placeholder="e.g., Programming Languages, Frameworks, Tools"
      />

      <FormField
        label="Skills (comma-separated)"
        name="skills"
        type="textarea"
        value={skillGroupData.skills?.join(", ") ?? ""}
        onChange={(value) =>
          onChange({
            ...skillGroupData,
            skills: value
              ? value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [],
          })
        }
        rows={3}
        placeholder="React, TypeScript, Node.js"
        required
      />
    </div>
  )
}

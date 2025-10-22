import React from "react"
import type { UpdateContentItemData, UpdateProfileSectionData } from "../../../../types/content-items"
import { FormField } from "../FormField"

interface ProfileSectionEditProps {
  data: UpdateContentItemData
  onChange: (data: UpdateContentItemData) => void
}

export const ProfileSectionEdit: React.FC<ProfileSectionEditProps> = ({ data, onChange }) => {
  const profileSectionData = data as UpdateProfileSectionData

  return (
    <div className="flex flex-col gap-4 mb-3">
      <FormField
        label="Heading"
        name="heading"
        value={profileSectionData.heading ?? ""}
        onChange={(value) => onChange({ ...profileSectionData, heading: value })}
        required
        placeholder="About Me, Introduction"
      />

      <FormField
        label="Content"
        name="content"
        type="textarea"
        value={profileSectionData.content ?? ""}
        onChange={(value) => onChange({ ...profileSectionData, content: value })}
        rows={8}
        required
      />
    </div>
  )
}

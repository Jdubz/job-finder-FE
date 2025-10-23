import React from "react"
import type { UpdateContentItemData, UpdateTextSectionData } from "../../../../types/content-items"
import { FormField } from "../FormField"
import { Label } from "../../../../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select"

interface TextSectionEditProps {
  data: UpdateContentItemData
  onChange: (data: UpdateContentItemData) => void
}

export const TextSectionEdit: React.FC<TextSectionEditProps> = ({ data, onChange }) => {
  const textSectionData = data as UpdateTextSectionData

  return (
    <div className="flex flex-col gap-4 mb-3">
      <FormField
        label="Heading"
        name="heading"
        value={textSectionData.heading ?? ""}
        onChange={(value) => onChange({ ...textSectionData, heading: value })}
        placeholder="Section title (optional)"
      />

      <div>
        <Label htmlFor="format" className="mb-2 block">
          Content Format
        </Label>
        <Select
          value={textSectionData.format ?? "plain"}
          onValueChange={(value) =>
            onChange({ ...textSectionData, format: value as "markdown" | "plain" | "html" })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="plain">Plain Text</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <FormField
        label="Content"
        name="content"
        type="textarea"
        value={textSectionData.content ?? ""}
        onChange={(value) => onChange({ ...textSectionData, content: value })}
        rows={12}
        placeholder="Your content here..."
        required
      />
    </div>
  )
}

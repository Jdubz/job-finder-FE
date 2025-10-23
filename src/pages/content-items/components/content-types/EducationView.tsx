import React from "react"
import type { EducationItem } from "../../../../types/content-items"
import { formatMonthYear } from "../../../../utils/dateFormat"
import { Badge } from "../../../../components/ui/badge"
import { GraduationCap, MapPin, Calendar, ExternalLink, Award } from "lucide-react"
import { Separator } from "../../../../components/ui/separator"

interface EducationViewProps {
  item: EducationItem
}

export const EducationView: React.FC<EducationViewProps> = ({ item }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">{item.institution}</h3>
        </div>

        {(item.degree || item.field) && (
          <p className="text-base font-medium text-muted-foreground">
            {item.degree}
            {item.degree && item.field && " in "}
            {item.field}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {item.startDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {formatMonthYear(item.startDate)} – {item.endDate ? formatMonthYear(item.endDate) : "Present"}
              </span>
            </div>
          )}
          {item.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{item.location}</span>
            </div>
          )}
        </div>

        {item.honors && (
          <div className="flex items-center gap-1 text-sm">
            <Award className="h-4 w-4 text-amber-500" />
            <span className="font-medium text-amber-600">{item.honors}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {item.description && (
        <>
          <Separator />
          <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        </>
      )}

      {/* Relevant Courses */}
      {item.relevantCourses && item.relevantCourses.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Relevant Courses</h4>
            <div className="flex flex-wrap gap-1">
              {item.relevantCourses.map((course) => (
                <Badge key={course} variant="secondary" className="text-xs">
                  {course}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Credential */}
      {item.credentialUrl && (
        <>
          <Separator />
          <a
            href={item.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            View Credential
            {item.credentialId && <span className="text-muted-foreground">({item.credentialId})</span>}
            <ExternalLink className="h-3 w-3" />
          </a>
        </>
      )}
    </div>
  )
}

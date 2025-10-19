/**
 * Prompts API Client
 *
 * Handles AI prompts configuration management.
 * Manages prompt templates for resume generation, cover letters, job scraping, and matching.
 */

import { db } from "@/config/firebase"
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore"

export interface PromptConfig {
  resumeGeneration: string
  coverLetterGeneration: string
  jobScraping: string
  jobMatching: string
  updatedAt?: Date
  updatedBy?: string
}

export const DEFAULT_PROMPTS: PromptConfig = {
  resumeGeneration: `You are an expert resume writer. Generate a professional resume based on the following information:

Job Description: {{jobDescription}}
Job Title: {{jobTitle}}
Company: {{companyName}}

User Experience:
{{userExperience}}

User Skills:
{{userSkills}}

Additional Instructions: {{additionalInstructions}}

Create a tailored resume that highlights relevant experience and skills for this specific role.`,

  coverLetterGeneration: `You are an expert cover letter writer. Generate a compelling cover letter based on:

Job Description: {{jobDescription}}
Job Title: {{jobTitle}}
Company: {{companyName}}

User Experience:
{{userExperience}}

Match Reason: {{matchReason}}

Additional Instructions: {{additionalInstructions}}

Write a personalized cover letter that demonstrates enthusiasm and fit for the role.`,

  jobScraping: `Extract job posting information from the provided HTML content.

HTML Content: {{htmlContent}}

Extract and return structured data including:
- Job Title
- Company Name
- Location
- Job Type (Full-time, Part-time, Contract, etc.)
- Salary Range (if available)
- Job Description
- Required Skills
- Qualifications
- Benefits

Return the data in JSON format.`,

  jobMatching: `Analyze the job match score and provide reasoning.

Job Description: {{jobDescription}}
User Resume: {{userResume}}
User Skills: {{userSkills}}

Evaluate:
1. Skills alignment (technical and soft skills)
2. Experience relevance
3. Role fit
4. Growth potential

Provide:
- Match score (0-100)
- Match reason (why this is a good fit)
- Strengths (what makes the candidate strong)
- Concerns (potential gaps or mismatches)
- Customization recommendations (what to emphasize)`,
}

export class PromptsClient {
  private collectionName = "job-finder-config"
  private documentId = "ai-prompts"

  /**
   * Convert Firestore timestamps to Dates
   */
  private convertTimestamps(data: Record<string, unknown>): PromptConfig {
    const converted = { ...data }
    if (converted.updatedAt instanceof Timestamp) {
      converted.updatedAt = converted.updatedAt.toDate()
    }
    return converted as unknown as PromptConfig
  }

  /**
   * Get AI prompts configuration
   */
  async getPrompts(): Promise<PromptConfig> {
    try {
      const docRef = doc(db, this.collectionName, this.documentId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        // Return defaults if no custom prompts exist
        return DEFAULT_PROMPTS
      }

      return this.convertTimestamps(docSnap.data())
    } catch (error) {
      console.error("Error fetching prompts:", error)
      throw new Error("Failed to load AI prompts")
    }
  }

  /**
   * Save AI prompts configuration
   */
  async savePrompts(
    prompts: Omit<PromptConfig, "updatedAt" | "updatedBy">,
    userEmail: string,
  ): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, this.documentId)

      const data = {
        ...prompts,
        updatedAt: new Date(),
        updatedBy: userEmail,
      }

      await setDoc(docRef, data)
    } catch (error) {
      console.error("Error saving prompts:", error)
      throw new Error("Failed to save AI prompts")
    }
  }

  /**
   * Reset prompts to defaults
   */
  async resetToDefaults(userEmail: string): Promise<void> {
    return this.savePrompts(DEFAULT_PROMPTS, userEmail)
  }

  /**
   * Validate prompt format
   * Checks for required variable placeholders
   */
  validatePrompt(prompt: string, requiredVariables: string[]): {
    valid: boolean
    missing: string[]
  } {
    const regex = /\{\{(\w+)\}\}/g
    const foundVariables = new Set<string>()
    let match

    while ((match = regex.exec(prompt)) !== null) {
      foundVariables.add(match[1])
    }

    const missing = requiredVariables.filter(
      (variable) => !foundVariables.has(variable),
    )

    return {
      valid: missing.length === 0,
      missing,
    }
  }

  /**
   * Extract all variables from a prompt
   */
  extractVariables(prompt: string): string[] {
    const regex = /\{\{(\w+)\}\}/g
    const variables: string[] = []
    let match

    while ((match = regex.exec(prompt)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }

    return variables
  }
}

// Export singleton instance
export const promptsClient = new PromptsClient()

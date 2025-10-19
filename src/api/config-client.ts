/**
 * Config API Client
 *
 * Handles job-finder configuration management.
 * Manages stop lists, queue settings, and AI settings in Firestore.
 */

import { db } from "@/config/firebase"
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore"
import type {
  StopList,
  QueueSettings,
  AISettings,
} from "@jsdubzw/job-finder-shared-types"

export class ConfigClient {
  private collectionName = "job-finder-config"

  /**
   * Convert Firestore timestamps to Dates
   */
  private convertTimestamps<T extends Record<string, any>>(data: T): T {
    const converted = { ...data } as any
    Object.keys(converted).forEach((key) => {
      if (converted[key] instanceof Timestamp) {
        converted[key] = converted[key].toDate()
      }
    })
    return converted as T
  }

  /**
   * Get stop list configuration
   */
  async getStopList(): Promise<StopList | null> {
    const docRef = doc(db, this.collectionName, "stop-list")
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return this.convertTimestamps(docSnap.data() as StopList)
  }

  /**
   * Update stop list configuration
   */
  async updateStopList(
    stopList: Partial<StopList>,
    userEmail: string,
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, "stop-list")
    const docSnap = await getDoc(docRef)

    const updates = {
      ...stopList,
      updatedAt: new Date(),
      updatedBy: userEmail,
    }

    if (docSnap.exists()) {
      await updateDoc(docRef, updates)
    } else {
      await setDoc(docRef, {
        excludedCompanies: [],
        excludedKeywords: [],
        excludedDomains: [],
        ...updates,
      })
    }
  }

  /**
   * Add company to stop list
   */
  async addExcludedCompany(companyName: string, userEmail: string): Promise<void> {
    const stopList = await this.getStopList()
    const excludedCompanies = stopList?.excludedCompanies || []

    if (!excludedCompanies.includes(companyName)) {
      await this.updateStopList(
        {
          excludedCompanies: [...excludedCompanies, companyName],
        },
        userEmail,
      )
    }
  }

  /**
   * Remove company from stop list
   */
  async removeExcludedCompany(companyName: string, userEmail: string): Promise<void> {
    const stopList = await this.getStopList()
    const excludedCompanies = stopList?.excludedCompanies || []

    await this.updateStopList(
      {
        excludedCompanies: excludedCompanies.filter((c) => c !== companyName),
      },
      userEmail,
    )
  }

  /**
   * Add keyword to stop list
   */
  async addExcludedKeyword(keyword: string, userEmail: string): Promise<void> {
    const stopList = await this.getStopList()
    const excludedKeywords = stopList?.excludedKeywords || []

    if (!excludedKeywords.includes(keyword)) {
      await this.updateStopList(
        {
          excludedKeywords: [...excludedKeywords, keyword],
        },
        userEmail,
      )
    }
  }

  /**
   * Remove keyword from stop list
   */
  async removeExcludedKeyword(keyword: string, userEmail: string): Promise<void> {
    const stopList = await this.getStopList()
    const excludedKeywords = stopList?.excludedKeywords || []

    await this.updateStopList(
      {
        excludedKeywords: excludedKeywords.filter((k) => k !== keyword),
      },
      userEmail,
    )
  }

  /**
   * Add domain to stop list
   */
  async addExcludedDomain(domain: string, userEmail: string): Promise<void> {
    const stopList = await this.getStopList()
    const excludedDomains = stopList?.excludedDomains || []

    if (!excludedDomains.includes(domain)) {
      await this.updateStopList(
        {
          excludedDomains: [...excludedDomains, domain],
        },
        userEmail,
      )
    }
  }

  /**
   * Remove domain from stop list
   */
  async removeExcludedDomain(domain: string, userEmail: string): Promise<void> {
    const stopList = await this.getStopList()
    const excludedDomains = stopList?.excludedDomains || []

    await this.updateStopList(
      {
        excludedDomains: excludedDomains.filter((d) => d !== domain),
      },
      userEmail,
    )
  }

  /**
   * Get queue settings
   */
  async getQueueSettings(): Promise<QueueSettings | null> {
    const docRef = doc(db, this.collectionName, "queue-settings")
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return this.convertTimestamps(docSnap.data() as QueueSettings)
  }

  /**
   * Update queue settings
   */
  async updateQueueSettings(
    settings: Partial<QueueSettings>,
    userEmail: string,
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, "queue-settings")
    const docSnap = await getDoc(docRef)

    const updates = {
      ...settings,
      updatedAt: new Date(),
      updatedBy: userEmail,
    }

    if (docSnap.exists()) {
      await updateDoc(docRef, updates)
    } else {
      await setDoc(docRef, {
        maxRetries: 3,
        retryDelaySeconds: 300,
        processingTimeout: 600,
        ...updates,
      })
    }
  }

  /**
   * Get AI settings
   */
  async getAISettings(): Promise<AISettings | null> {
    const docRef = doc(db, this.collectionName, "ai-settings")
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return this.convertTimestamps(docSnap.data() as AISettings)
  }

  /**
   * Update AI settings
   */
  async updateAISettings(
    settings: Partial<AISettings>,
    userEmail: string,
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, "ai-settings")
    const docSnap = await getDoc(docRef)

    const updates = {
      ...settings,
      updatedAt: new Date(),
      updatedBy: userEmail,
    }

    if (docSnap.exists()) {
      await updateDoc(docRef, updates)
    } else {
      await setDoc(docRef, {
        provider: "claude",
        model: "claude-sonnet-4",
        minMatchScore: 70,
        costBudgetDaily: 10.0,
        ...updates,
      })
    }
  }
}

// Export singleton instance
export const configClient = new ConfigClient()

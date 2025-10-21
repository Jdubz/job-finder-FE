/**
 * Content Items API Client
 *
 * Handles CRUD operations for content items (experience, projects, skills, etc.)
 * Integrates with Firebase Cloud Functions content-items API.
 */

import { BaseApiClient, type RequestOptions } from "./base-client"
import type {
  ContentItem,
  ContentItemWithChildren,
  ContentItemApiResponse,
  CreateContentItemData,
  UpdateContentItemData,
  ContentItemFilters,
  ContentItemType,
} from "@/types/content-items"

/**
 * Content Items API Client
 */
export class ContentItemsClient extends BaseApiClient {
  private readonly baseEndpoint = "manageContentItems"

  /**
   * Get all content items with optional filtering
   */
  async getItems(filters?: ContentItemFilters, options?: RequestOptions): Promise<ContentItem[]> {
    const params = new URLSearchParams()

    if (filters) {
      if (filters.type) params.append("type", filters.type.join(","))
      if (filters.parentId !== undefined) params.append("parentId", filters.parentId || "")
      if (filters.visibility) params.append("visibility", filters.visibility.join(","))
      if (filters.tags) params.append("tags", filters.tags.join(","))
      if (filters.search) params.append("search", filters.search)
      if (filters.limit) params.append("limit", filters.limit.toString())
      if (filters.offset) params.append("offset", filters.offset.toString())
    }

    // Backend route is /content-items
    const url = params.toString()
      ? `${this.baseEndpoint}/content-items?${params}`
      : `${this.baseEndpoint}/content-items`
    const response = await this.get<ContentItemApiResponse>(url, options)

    if (!response.success || !response.data?.items) {
      throw new Error(response.error || "Failed to fetch content items")
    }

    return response.data.items
  }

  /**
   * Get content items organized in a hierarchy (with children)
   */
  async getHierarchy(
    filters?: ContentItemFilters,
    options?: RequestOptions
  ): Promise<ContentItemWithChildren[]> {
    const params = new URLSearchParams()
    // Backend route is /content-items/hierarchy, not query parameter

    if (filters) {
      if (filters.type) params.append("type", filters.type.join(","))
      if (filters.visibility) params.append("visibility", filters.visibility.join(","))
      if (filters.tags) params.append("tags", filters.tags.join(","))
      if (filters.search) params.append("search", filters.search)
    }

    const url = params.toString()
      ? `${this.baseEndpoint}/content-items/hierarchy?${params}`
      : `${this.baseEndpoint}/content-items/hierarchy`

    const response = await this.get<ContentItemApiResponse>(url, options)

    if (!response.success || !response.data?.hierarchy) {
      throw new Error(response.error || "Failed to fetch content items hierarchy")
    }

    return response.data.hierarchy
  }

  /**
   * Get a single content item by ID
   */
  async getItem(id: string, options?: RequestOptions): Promise<ContentItem> {
    const response = await this.get<ContentItemApiResponse>(`${this.baseEndpoint}/content-items/${id}`, options)

    if (!response.success || !response.data?.item) {
      throw new Error(response.error || "Failed to fetch content item")
    }

    return response.data.item
  }

  /**
   * Create a new content item
   */
  async createItem(data: CreateContentItemData, options?: RequestOptions): Promise<ContentItem> {
    const response = await this.post<ContentItemApiResponse>(
      `${this.baseEndpoint}/content-items`,
      data,
      options
    )

    if (!response.success || !response.data?.item) {
      throw new Error(response.error || "Failed to create content item")
    }

    return response.data.item
  }

  /**
   * Update an existing content item
   */
  async updateItem(
    id: string,
    data: UpdateContentItemData,
    options?: RequestOptions
  ): Promise<ContentItem> {
    const response = await this.put<ContentItemApiResponse>(
      `${this.baseEndpoint}/content-items/${id}`,
      data,
      options
    )

    if (!response.success || !response.data?.item) {
      throw new Error(response.error || "Failed to update content item")
    }

    return response.data.item
  }

  /**
   * Delete a content item (and optionally its children)
   */
  async deleteItem(
    id: string,
    deleteChildren?: boolean,
    options?: RequestOptions
  ): Promise<number> {
    const url = deleteChildren
      ? `${this.baseEndpoint}/content-items/${id}/cascade`
      : `${this.baseEndpoint}/content-items/${id}`

    const response = await this.delete<ContentItemApiResponse>(url, options)

    if (!response.success) {
      throw new Error(response.error || "Failed to delete content item")
    }

    return response.data?.deletedCount || 1
  }

  /**
   * Reorder content items
   */
  async reorderItems(
    items: Array<{ id: string; order: number }>,
    options?: RequestOptions
  ): Promise<void> {
    const response = await this.post<ContentItemApiResponse>(
      `${this.baseEndpoint}/content-items/reorder`,
      {
        items,
      },
      options
    )

    if (!response.success) {
      throw new Error(response.error || "Failed to reorder content items")
    }
  }

  /**
   * Get content items by type
   */
  async getItemsByType<T extends ContentItem>(
    type: ContentItemType,
    options?: RequestOptions
  ): Promise<T[]> {
    const items = await this.getItems({ type: [type] }, options)
    return items as T[]
  }

  /**
   * Get all companies (work experience)
   */
  async getCompanies(options?: RequestOptions) {
    return this.getItemsByType("company", options)
  }

  /**
   * Get all projects (optionally for a specific company)
   */
  async getProjects(companyId?: string, options?: RequestOptions) {
    const filters: ContentItemFilters = companyId
      ? { type: ["project"], parentId: companyId }
      : { type: ["project"] }
    return this.getItems(filters, options)
  }

  /**
   * Get all skill groups
   */
  async getSkillGroups(options?: RequestOptions) {
    return this.getItemsByType("skill-group", options)
  }

  /**
   * Get all education items
   */
  async getEducation(options?: RequestOptions) {
    return this.getItemsByType("education", options)
  }

  /**
   * Get profile sections
   */
  async getProfileSections(options?: RequestOptions) {
    return this.getItemsByType("profile-section", options)
  }

  /**
   * Get text sections
   */
  async getTextSections(options?: RequestOptions) {
    return this.getItemsByType("text-section", options)
  }

  /**
   * Import content items from JSON
   */
  async importItems(
    items: CreateContentItemData[],
    options?: RequestOptions
  ): Promise<ContentItem[]> {
    const response = await this.post<ContentItemApiResponse>(
      `${this.baseEndpoint}/import`,
      {
        items,
      },
      options
    )

    if (!response.success || !response.data?.items) {
      throw new Error(response.error || "Failed to import content items")
    }

    return response.data.items
  }

  /**
   * Export all content items
   */
  async exportItems(
    filters?: ContentItemFilters,
    options?: RequestOptions
  ): Promise<ContentItem[]> {
    const params = new URLSearchParams()

    if (filters) {
      if (filters.type) params.append("type", filters.type.join(","))
      if (filters.visibility) params.append("visibility", filters.visibility.join(","))
      if (filters.tags) params.append("tags", filters.tags.join(","))
    }

    const url = params.toString()
      ? `${this.baseEndpoint}/export?${params}`
      : `${this.baseEndpoint}/export`

    const response = await this.get<ContentItemApiResponse>(url, options)

    if (!response.success || !response.data?.items) {
      throw new Error(response.error || "Failed to export content items")
    }

    return response.data.items
  }

  /**
   * Search content items
   */
  async searchItems(query: string, options?: RequestOptions): Promise<ContentItem[]> {
    return this.getItems({ search: query }, options)
  }
}

// Create singleton instance
import { api } from "@/config/api"
export const contentItemsClient = new ContentItemsClient(api.baseUrl)

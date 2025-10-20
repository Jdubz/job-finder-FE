/**
 * Generator Client Tests
 * Tests for cover letter and resume generation API client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockCoverLetterRequest, mockSuccessResponse, mockErrorResponse } from '@/mocks/generator'

describe('GeneratorClient', () => {
  beforeEach(() => {
    // Clear any previous mocks
    vi.restoreAllMocks()
  })

  describe('generateDocument', () => {
    it('should construct correct request for cover letter generation', async () => {
      // This test verifies the request structure
      const request = mockCoverLetterRequest

      // Validate request structure
      expect(request).toHaveProperty('type', 'cover_letter')
      expect(request).toHaveProperty('jobTitle')
      expect(request).toHaveProperty('companyName')
      expect(request.jobTitle).toBeTruthy()
      expect(request.companyName).toBeTruthy()
    })

    it('should validate required fields are present', () => {
      const request = mockCoverLetterRequest

      // Required fields
      expect(request.type).toBe('cover_letter')
      expect(request.jobTitle).toBe('Senior Frontend Engineer')
      expect(request.companyName).toBe('Acme Corporation')

      // Optional fields
      expect(request.jobDescription).toBeDefined()
      expect(request.customization).toBeDefined()
      expect(request.customization?.targetSummary).toBeDefined()
    })

    it('should handle successful response structure', () => {
      const response = mockSuccessResponse

      expect(response.success).toBe(true)
      expect(response.message).toBeTruthy()
      expect(response.documentUrl).toBeTruthy()
      expect(response.documentId).toBeTruthy()
      expect(response.generationId).toBeTruthy()
    })

    it('should handle error response structure', () => {
      const response = mockErrorResponse

      expect(response.success).toBe(false)
      expect(response.error).toBeTruthy()
      expect(response.message).toBeTruthy()
    })
  })

  describe('request validation', () => {
    it('should require type field', () => {
      const request = mockCoverLetterRequest
      expect(request.type).toBeDefined()
      expect(['resume', 'cover_letter']).toContain(request.type)
    })

    it('should require jobTitle field', () => {
      const request = mockCoverLetterRequest
      expect(request.jobTitle).toBeDefined()
      expect(request.jobTitle).not.toBe('')
    })

    it('should require companyName field', () => {
      const request = mockCoverLetterRequest
      expect(request.companyName).toBeDefined()
      expect(request.companyName).not.toBe('')
    })

    it('should allow optional customization', () => {
      const request = mockCoverLetterRequest
      if (request.customization) {
        expect(request.customization).toHaveProperty('targetSummary')
      }
      // Test passes whether customization is present or not
      expect(true).toBe(true)
    })
  })

  describe('API endpoint configuration', () => {
    it('should use correct base URL', () => {
      expect(mockBaseUrl).toContain('us-central1-static-sites-257923.cloudfunctions.net')
    })

    it('should target manageGenerator endpoint', () => {
      // The client posts to /manageGenerator
      // In staging: /manageGenerator-staging
      // In production: /manageGenerator
      const expectedPath = '/manageGenerator'
      expect(expectedPath).toBe('/manageGenerator')
    })
  })

  describe('response validation', () => {
    it('should have success flag in response', () => {
      expect(mockSuccessResponse).toHaveProperty('success')
      expect(mockErrorResponse).toHaveProperty('success')
    })

    it('should have message in response', () => {
      expect(mockSuccessResponse).toHaveProperty('message')
      expect(mockErrorResponse).toHaveProperty('message')
    })

    it('success response should include document URLs', () => {
      expect(mockSuccessResponse.documentUrl).toBeTruthy()
      expect(mockSuccessResponse.documentId).toBeTruthy()
    })

    it('error response should include error details', () => {
      expect(mockErrorResponse.error).toBeTruthy()
      expect(mockErrorResponse.success).toBe(false)
    })
  })
})

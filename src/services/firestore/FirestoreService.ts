/**
 * Firestore Service
 *
 * Type-safe service layer for Firestore operations with caching and real-time subscriptions
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  startAt,
  onSnapshot,
  Timestamp,
  type Firestore,
  type QueryConstraint,
  type DocumentData,
  type WhereFilterOp,
  type OrderByDirection,
} from "firebase/firestore"
import { db } from "@/config/firebase"
import type {
  CollectionTypeMap,
  DocumentWithId,
  QueryConstraints,
  SubscriptionCallback,
  DocumentSubscriptionCallback,
  ErrorCallback,
  UnsubscribeFn,
  ClientSideDocument,
} from "./types"

/**
 * Convert Firestore Timestamp to Date
 */
function convertTimestamps<T extends DocumentData>(data: T): ClientSideDocument<T> {
  const result: Record<string, unknown> = { ...data }

  for (const key in result) {
    const value = result[key]

    if (value instanceof Timestamp) {
      result[key] = value.toDate()
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = convertTimestamps(value as DocumentData)
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item && typeof item === "object" ? convertTimestamps(item as DocumentData) : item
      )
    }
  }

  return result as ClientSideDocument<T>
}

/**
 * Build query constraints from our simplified format
 */
function buildQueryConstraints(constraints?: QueryConstraints): QueryConstraint[] {
  const queryConstraints: QueryConstraint[] = []

  if (constraints?.where) {
    for (const w of constraints.where) {
      queryConstraints.push(where(w.field, w.operator as WhereFilterOp, w.value))
    }
  }

  if (constraints?.orderBy) {
    for (const o of constraints.orderBy) {
      queryConstraints.push(orderBy(o.field, o.direction as OrderByDirection))
    }
  }

  if (constraints?.limit) {
    queryConstraints.push(limit(constraints.limit))
  }

  if (constraints?.startAfter) {
    queryConstraints.push(startAfter(constraints.startAfter))
  }

  if (constraints?.startAt) {
    queryConstraints.push(startAt(constraints.startAt))
  }

  return queryConstraints
}

/**
 * Firestore Service Class
 *
 * Provides type-safe CRUD operations for all Firestore collections
 */
export class FirestoreService {
  private db: Firestore

  constructor(firestore: Firestore = db) {
    this.db = firestore
  }

  /**
   * Get a single document by ID
   */
  async getDocument<K extends keyof CollectionTypeMap>(
    collectionName: K,
    documentId: string
  ): Promise<DocumentWithId<CollectionTypeMap[K]> | null> {
    const docRef = doc(this.db, collectionName, documentId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = convertTimestamps(docSnap.data())
    return {
      id: docSnap.id,
      ...data,
    } as DocumentWithId<CollectionTypeMap[K]>
  }

  /**
   * Get multiple documents with optional query constraints
   */
  async getDocuments<K extends keyof CollectionTypeMap>(
    collectionName: K,
    constraints?: QueryConstraints
  ): Promise<DocumentWithId<CollectionTypeMap[K]>[]> {
    const collectionRef = collection(this.db, collectionName)
    const queryConstraints = buildQueryConstraints(constraints)

    const q =
      queryConstraints.length > 0 ? query(collectionRef, ...queryConstraints) : collectionRef

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = convertTimestamps(doc.data())
      return {
        id: doc.id,
        ...data,
      } as DocumentWithId<CollectionTypeMap[K]>
    })
  }

  /**
   * Create a new document with auto-generated ID
   */
  async createDocument<K extends keyof CollectionTypeMap>(
    collectionName: K,
    data: Omit<CollectionTypeMap[K], "id" | "createdAt" | "updatedAt"> & {
      createdAt?: Timestamp | Date
      updatedAt?: Timestamp | Date
    }
  ): Promise<string> {
    const collectionRef = collection(this.db, collectionName)
    const now = Timestamp.now()

    const docData = {
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    }

    const docRef = await addDoc(collectionRef, docData)
    return docRef.id
  }

  /**
   * Create or update a document with a specific ID
   */
  async setDocument<K extends keyof CollectionTypeMap>(
    collectionName: K,
    documentId: string,
    data: Omit<CollectionTypeMap[K], "id" | "createdAt" | "updatedAt"> & {
      createdAt?: Timestamp | Date
      updatedAt?: Timestamp | Date
    },
    merge = true
  ): Promise<void> {
    const docRef = doc(this.db, collectionName, documentId)
    const now = Timestamp.now()

    const docData: Record<string, unknown> = {
      ...data,
      updatedAt: now,
    }

    // Only set createdAt if it's a new document (not merging)
    if (!merge) {
      docData.createdAt = data.createdAt || now
    }

    await setDoc(docRef, docData, { merge })
  }

  /**
   * Update an existing document
   */
  async updateDocument<K extends keyof CollectionTypeMap>(
    collectionName: K,
    documentId: string,
    data: Partial<CollectionTypeMap[K]>
  ): Promise<void> {
    const docRef = doc(this.db, collectionName, documentId)
    const now = Timestamp.now()

    await updateDoc(docRef, {
      ...data,
      updatedAt: now,
    })
  }

  /**
   * Delete a document
   */
  async deleteDocument<K extends keyof CollectionTypeMap>(
    collectionName: K,
    documentId: string
  ): Promise<void> {
    const docRef = doc(this.db, collectionName, documentId)
    await deleteDoc(docRef)
  }

  /**
   * Subscribe to a collection with real-time updates
   */
  subscribeToCollection<K extends keyof CollectionTypeMap>(
    collectionName: K,
    onData: SubscriptionCallback<CollectionTypeMap[K]>,
    onError: ErrorCallback,
    constraints?: QueryConstraints
  ): UnsubscribeFn {
    const collectionRef = collection(this.db, collectionName)
    const queryConstraints = buildQueryConstraints(constraints)

    const q =
      queryConstraints.length > 0 ? query(collectionRef, ...queryConstraints) : collectionRef

    let hasError = false
    
    return onSnapshot(
      q,
      (snapshot) => {
        hasError = false // Reset error flag on successful snapshot
        const documents = snapshot.docs.map((doc) => {
          const data = convertTimestamps(doc.data())
          return {
            id: doc.id,
            ...data,
          } as DocumentWithId<CollectionTypeMap[K]>
        })

        onData(documents)
      },
      (error) => {
        // Only call error handler once to prevent infinite loops
        if (!hasError) {
          hasError = true
          console.error(`Firestore subscription error in ${collectionName}:`, error)
          
          // Provide empty array on permission errors to prevent crashes
          if (error.code === 'permission-denied') {
            console.warn(`Permission denied for ${collectionName}, providing empty data`)
            onData([])
          } else {
            onError(error as Error)
          }
        }
      }
    )
  }

  /**
   * Subscribe to a single document with real-time updates
   */
  subscribeToDocument<K extends keyof CollectionTypeMap>(
    collectionName: K,
    documentId: string,
    onData: DocumentSubscriptionCallback<CollectionTypeMap[K]>,
    onError: ErrorCallback
  ): UnsubscribeFn {
    const docRef = doc(this.db, collectionName, documentId)
    
    let hasError = false

    return onSnapshot(
      docRef,
      (docSnap) => {
        hasError = false // Reset error flag on successful snapshot
        if (!docSnap.exists()) {
          onData(null)
          return
        }

        const data = convertTimestamps(docSnap.data())
        onData({
          id: docSnap.id,
          ...data,
        } as DocumentWithId<CollectionTypeMap[K]>)
      },
      (error) => {
        // Only call error handler once to prevent infinite loops
        if (!hasError) {
          hasError = true
          console.error(`Firestore document subscription error for ${collectionName}/${documentId}:`, error)
          
          // Provide null on permission errors to prevent crashes
          if (error.code === 'permission-denied') {
            console.warn(`Permission denied for ${collectionName}/${documentId}, providing null`)
            onData(null)
          } else {
            onError(error as Error)
          }
        }
      }
    )
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService()

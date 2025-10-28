import { initializeApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth, connectAuthEmulator } from "firebase/auth"
import {
  type Firestore,
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore"
import { logger } from "@/services/logging"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase
export const app: FirebaseApp = initializeApp(firebaseConfig)
export const auth: Auth = getAuth(app)

// Initialize Firestore with database ID and modern persistence
const databaseId = import.meta.env.VITE_FIRESTORE_DATABASE_ID

// Log configuration for debugging
console.log("🔥 Firebase Firestore Configuration:")
console.log("  - MODE:", import.meta.env.MODE)
console.log("  - DATABASE_ID env var:", import.meta.env.VITE_FIRESTORE_DATABASE_ID)
console.log("  - Using database ID:", databaseId || "(default)")

// CRITICAL: Must have databaseId set, or it defaults to (default) which doesn't exist
if (!databaseId || databaseId === "(default)") {
  const errorMsg = `CRITICAL ERROR: VITE_FIRESTORE_DATABASE_ID is not set or is "(default)"! This will cause 400 errors.`
  console.error(errorMsg)
  throw new Error(errorMsg)
}

// Use modern cache API instead of deprecated enableMultiTabIndexedDbPersistence
// Firebase SDK requires databaseId in format: `projects/{project}/databases/{database}`
export const db: Firestore = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  },
  databaseId
)

// Connect to Firebase emulators in development/test environments
if (import.meta.env.VITE_USE_EMULATORS === "true") {
  const authEmulatorHost = import.meta.env.FIREBASE_AUTH_EMULATOR_HOST || "localhost:9099"
  const firestoreEmulatorHost = import.meta.env.FIRESTORE_EMULATOR_HOST || "localhost:8080"

  // Extract host and port from emulator host string
  const [authHost, authPort] = authEmulatorHost.split(":")
  const [firestoreHost, firestorePort] = firestoreEmulatorHost.split(":")

  connectAuthEmulator(auth, `http://${authHost}:${authPort}`, { disableWarnings: true })
  connectFirestoreEmulator(db, firestoreHost, parseInt(firestorePort, 10))

  logger.info("database", "started", "Connected to Firebase emulators", {
    details: {
      authHost,
      authPort,
      firestoreHost,
      firestorePort,
    },
  })
}

import { initializeApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, type Firestore, connectFirestoreEmulator } from "firebase/firestore"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * Firestore Database ID
 * - Development (emulators): (default)
 * - Staging: portfolio-staging
 * - Production: portfolio
 */
const databaseId = import.meta.env.VITE_FIRESTORE_DATABASE_ID || "(default)"

// Initialize Firebase
export const app: FirebaseApp = initializeApp(firebaseConfig)
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app, databaseId)

// Connect to Firebase emulators in development/test environments
if (import.meta.env.VITE_USE_EMULATORS === "true") {
  const authEmulatorHost = import.meta.env.FIREBASE_AUTH_EMULATOR_HOST || "localhost:9099"
  const firestoreEmulatorHost = import.meta.env.FIRESTORE_EMULATOR_HOST || "localhost:8080"

  // Extract host and port from emulator host string
  const [authHost, authPort] = authEmulatorHost.split(":")
  const [firestoreHost, firestorePort] = firestoreEmulatorHost.split(":")

  connectAuthEmulator(auth, `http://${authHost}:${authPort}`, { disableWarnings: true })
  connectFirestoreEmulator(db, firestoreHost, parseInt(firestorePort, 10))

  console.log("🔧 Connected to Firebase emulators")
  console.log(`  Auth: ${authHost}:${authPort}`)
  console.log(`  Firestore: ${firestoreHost}:${firestorePort}`)
  console.log(`  Database: ${databaseId}`)
} else {
  console.log(`🔥 Firebase initialized`)
  console.log(`  Project: ${firebaseConfig.projectId}`)
  console.log(`  Database: ${databaseId}`)
}

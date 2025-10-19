import React, { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "@/config/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  isEditor: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditor, setIsEditor] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        // Get custom claims to check editor role
        const tokenResult = await firebaseUser.getIdTokenResult()
        setIsEditor(tokenResult.claims.role === "editor")
      } else {
        setIsEditor(false)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setIsEditor(false)
  }

  const value = {
    user,
    loading,
    isEditor,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

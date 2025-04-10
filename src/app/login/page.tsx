'use client'

import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../../lib/firebase'

export default function Login() {
  const router = useRouter()

  useEffect(() => {
    const auth = getAuth()
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) router.push('/dashboard')
    })
    return () => unsub()
  }, [router])

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const auth = getAuth()
      await signInWithPopup(auth, provider)
      router.push('/dashboard')
    } catch (error) {
      console.error('❌ Google login failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Welcome to Zento AI</h1>
      <p className="text-gray-600 mb-6">Sign in with Google to manage your Shopify store using AI.</p>
      <button
        onClick={handleLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded shadow"
      >
        🔐 Sign in with Google
      </button>
    </div>
  )
}

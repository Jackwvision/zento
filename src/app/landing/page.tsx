'use client'

import { useRouter } from 'next/navigation'
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from '../../../lib/firebase'

export default function LandingPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push('/dashboard')
      else setChecking(false)
    })
    return () => unsubscribe()
  }, [router])

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
    router.push('/dashboard')
  }

  if (checking) {
    return <div className="p-10 text-gray-600">⏳ Loading...</div>
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-purple-600 to-indigo-800 text-white">
      {/* Logo */}
      <div className="flex items-center mb-6">
        {/* <img src="/logo.png" alt="Zento AI Logo"  /> */}
        <span className="text-6xl font-extrabold tracking-tight">Zento AI</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center leading-tight">
        Enhance Your Shopify Store with AI
      </h1>

      <p className="text-lg md:text-xl text-center max-w-2xl mb-6">
        Improve your product titles, descriptions, and pricing. Get more visibility, conversions, and revenue with the power of AI.
      </p>

      <button
        onClick={handleSignIn}
        className="bg-white text-purple-800 font-bold py-3 px-6 rounded-xl shadow hover:bg-purple-100 transition"
      >
        🔐 Please Sign in with Google to Get Started
      </button>
    </main>
  )
}

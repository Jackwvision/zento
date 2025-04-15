'use client'

import { useRouter } from 'next/navigation'
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from '../../../lib/firebase'
import { useIsClient } from '../../../lib/hooks/useIsClient'

export default function LandingPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const isClient = useIsClient()

  useEffect(() => {
    if (!isClient) return

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push('/dashboard')
      else setChecking(false)
    })
    return () => unsubscribe()
  }, [isClient, router])

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
    router.push('/dashboard')
  }

  // ✅ Move render logic below hooks
  if (!isClient || checking) {
    return <div className="p-10 text-gray-600">⏳ Loading...</div>
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-white via-indigo-100 to-purple-200 text-gray-900">

      <div className="flex items-center mb-6">
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
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition duration-200 ease-in-out"
      >
        🔐 Sign in with Google to Get Started
      </button>

      <div className="grid md:grid-cols-3 gap-6 text-center mt-10 text-indigo-900">
        <div>
          <h3 className="text-xl font-bold mb-2">🔍 Smarter SEO</h3>
          <p>AI improves product titles & descriptions to boost search visibility.</p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">💸 Better Pricing</h3>
          <p>Get AI-optimized prices based on product content and industry tone.</p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">⚡ 1-Click Sync</h3>
          <p>Instantly sync updates back to your Shopify store with a single click.</p>
        </div>
      </div>
    </main>
  )
}

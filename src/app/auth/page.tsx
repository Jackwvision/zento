'use client'

import { auth } from '../../../lib/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()

  const signIn = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
    router.push('/dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Login to Zento</h1>
      <button
        onClick={signIn}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow"
      >
        Sign in with Google
      </button>
    </div>
  )
}

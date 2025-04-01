import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">🚀 Tailwind is Working!</h1>
      <p className="text-lg text-gray-700">You're now ready to build Zento 🎯</p>
      <a
        href="/auth"
        className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow"
      >
        Sign in with Google
      </a>
    </div>
  )
}

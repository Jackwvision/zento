import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { adminAuth } from '../../../../../lib/firebaseAdmin'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const shop = searchParams.get('shop')
    const code = searchParams.get('code')

    if (!shop || !code) {
      return new NextResponse('Missing parameters', { status: 400 })
    }

    const accessTokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_APP_CLIENT_ID,
        client_secret: process.env.SHOPIFY_APP_SECRET,
        code,
      }),
    })

    const accessTokenData = await accessTokenRes.json()
    const accessToken = accessTokenData.access_token

    if (!accessTokenData.access_token) {
      return new NextResponse('Failed to retrieve access token', { status: 500 })
    }

    // 1. Get UID from cookie or query param (simplest approach in dev)
    // const uid = searchParams.get('uid') // you must append it on redirect from client
    const cookieStore = await cookies()
    const uid = cookieStore.get('uid')?.value 

    await setDoc(doc(db, 'shops', shop), {
      shop,
      accessToken,
      connectedAt: Date.now(),
      uid,
    })

    if (uid) {
      await setDoc(doc(db, 'users', uid), {
        shop,
      })
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`)

  } catch (err) {
    console.error('OAuth callback error:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
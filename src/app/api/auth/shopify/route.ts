import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const shop = searchParams.get('shop')

  if (!shop) {
    return new NextResponse('Missing shop parameter', { status: 400 })
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SHOPIFY_SCOPES}&redirect_uri=${redirectUri}`

  return NextResponse.redirect(installUrl)
}

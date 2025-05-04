import admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // or use cert()
  })
}

export const adminAuth = admin.auth()
export const adminDb = admin.firestore()

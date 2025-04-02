import { doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function saveProduct(product: {
  id: string
  title: string
  description: string
  price: string
}) {
  try {
    await setDoc(doc(db, 'products', product.id), product)
    console.log('✅ Product saved to Firebase')
  } catch (err) {
    console.error('🔥 Error saving to Firebase:', err)
  }
}

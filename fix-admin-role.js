import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDG9hfrYJr-0CrxlmjcM13dpwsYDmbkIa4",
  authDomain: "minsu-disciplinary.firebaseapp.com",
  projectId: "minsu-disciplinary",
  storageBucket: "minsu-disciplinary.firebasestorage.app",
  messagingSenderId: "384721633771",
  appId: "1:384721633771:web:ce491fdb5ddd98366499ae"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function fixAdminRole() {
  const adminEmail = 'minsu.admin@gmail.com'
  const adminPassword = 'MinSU2024!'

  try {
    console.log('Logging in as admin...')
    
    // Login first
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword)
    console.log('✓ Logged in successfully')
    console.log('User UID:', userCredential.user.uid)

    // Now create/update the Firestore document with admin role
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      fullName: 'MinSU Administrator',
      email: adminEmail,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log('✓ Admin role set in Firestore')

    console.log('\n========================================')
    console.log('✅ ADMIN ROLE FIXED!')
    console.log('========================================')
    console.log('\nYou can now login with:')
    console.log(`Email:    ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log('\nThe account now has ADMIN privileges!')
    console.log('========================================\n')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error:', error.code)
    console.error('Message:', error.message)
    process.exit(1)
  }
}

fixAdminRole()

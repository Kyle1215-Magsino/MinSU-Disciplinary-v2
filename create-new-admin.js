import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
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

async function createAdminUser() {
  // Try different admin credentials
  const adminEmail = 'minsu.admin@gmail.com'
  const adminPassword = 'MinSU2024!'
  const adminName = 'MinSU Administrator'

  try {
    console.log('Creating new admin user...')
    console.log('Email:', adminEmail)
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword)
    console.log('✓ Admin user created in Firebase Auth')
    console.log('User UID:', userCredential.user.uid)

    // Add user data to Firestore with admin role
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      fullName: adminName,
      email: adminEmail,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log('✓ Admin user data saved to Firestore')

    console.log('\n========================================')
    console.log('✅ NEW ADMIN ACCOUNT CREATED!')
    console.log('========================================')
    console.log('\n📧 Admin Credentials:')
    console.log('------------------')
    console.log(`Email:    ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log('\n⚠️  SAVE THESE CREDENTIALS!')
    console.log('========================================\n')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error:', error.code)
    console.error('Message:', error.message)
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n✅ This email is already registered!')
      console.log('\nYou can login with:')
      console.log(`Email:    ${adminEmail}`)
      console.log(`Password: ${adminPassword}`)
    }
    
    process.exit(1)
  }
}

createAdminUser()

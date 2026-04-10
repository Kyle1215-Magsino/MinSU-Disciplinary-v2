import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDG9hfrYJr-0CrxlmjcM13dpwsYDmbkIa4",
  authDomain: "minsu-disciplinary.firebaseapp.com",
  projectId: "minsu-disciplinary",
  storageBucket: "minsu-disciplinary.firebasestorage.app",
  messagingSenderId: "384721633771",
  appId: "1:384721633771:web:ce491fdb5ddd98366499ae"
}

console.log('Initializing Firebase...')
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

console.log('Firebase initialized successfully!')
console.log('Auth domain:', firebaseConfig.authDomain)

async function testLogin() {
  const testEmail = 'admin@minsu.edu.ph'
  const testPassword = 'Admin123!'

  try {
    console.log('\nAttempting to login with:')
    console.log('Email:', testEmail)
    console.log('Password:', testPassword)
    
    const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword)
    console.log('\n✅ Login successful!')
    console.log('User ID:', userCredential.user.uid)
    console.log('Email:', userCredential.user.email)
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Login failed!')
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    if (error.code === 'auth/invalid-credential') {
      console.log('\n⚠️  The email or password is incorrect.')
      console.log('Please verify the credentials or create a new account.')
    } else if (error.code === 'auth/user-not-found') {
      console.log('\n⚠️  No user found with this email.')
      console.log('Please run: node create-admin.js')
    }
    
    process.exit(1)
  }
}

testLogin()

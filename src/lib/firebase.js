import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCQPo0mp4Ucllurfl3WkM5bKHdaVGBCMFY',
  authDomain: 'egk-community.firebaseapp.com',
  projectId: 'egk-community',
  storageBucket: 'egk-community.firebasestorage.app',
  messagingSenderId: '1064951000337',
  appId: '1:1064951000337:web:801c7701eea7ceb059b0b0',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app

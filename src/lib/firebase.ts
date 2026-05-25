import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "influential-media-1cf5x",
  appId: "1:1026757775472:web:ecdc324d7cd5e04f3ce4b5",
  apiKey: "AIzaSyDxuap8OrMrrjJ63MNq7G1Eft2e1SQbduk",
  authDomain: "influential-media-1cf5x.firebaseapp.com",
  storageBucket: "influential-media-1cf5x.firebasestorage.app",
  messagingSenderId: "1026757775472"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

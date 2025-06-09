import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCJYecpQBbsUO3ntjVMnR_4j7gcWt8V-9c",
  authDomain: "myapp-969dc.firebaseapp.com",
  projectId: "myapp-969dc",
  storageBucket: "myapp-969dc.appspot.com",
  messagingSenderId: "1030306801833",
  appId: "1:1030306801833:web:85253155d16d29d5cfe1b8"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth with React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Test AsyncStorage
const testAsyncStorage = async () => {
  try {
    await AsyncStorage.setItem('test_key', 'test_value');
    const value = await AsyncStorage.getItem('test_key');
    console.log('AsyncStorage test value:', value);
  } catch (error) {
    console.error('AsyncStorage test error:', error);
  }
};

testAsyncStorage();

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
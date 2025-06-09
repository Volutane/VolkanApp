import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthGate({ children }) {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setChecking(false);

      // Public pages that don't require authentication
      const publicPages = ['/', '/WelcomeScreen', '/SignInScreen', '/SignUpScreen'];
      const isPublicPage = publicPages.includes(pathname);

      if (user) {
        // Store user data in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        }));

        // If user is authenticated and on auth pages, redirect to home
        if (isPublicPage) {
          router.replace('/HomeScreen');
        }
      } else {
        // Clear user data from AsyncStorage
        await AsyncStorage.removeItem('user');

        // If user is not authenticated and not on public pages, redirect to sign in
        if (!isPublicPage) {
          router.replace('/SignInScreen');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname]);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
}

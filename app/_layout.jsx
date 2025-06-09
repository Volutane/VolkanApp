import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext } from 'react';
import { ThemeProvider, ThemeContext } from '../components/ThemeContext';
import AuthGate from '../components/AuthGate';

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthWrappedLayout />
    </ThemeProvider>
  );
}

const AuthWrappedLayout = () => {
  const { isLightMode } = useContext(ThemeContext);

  return (
    <AuthGate>
      <StatusBar
        style={isLightMode ? 'dark' : 'light'}
        backgroundColor="black"
        translucent={false}
      />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AuthGate>
  );
};

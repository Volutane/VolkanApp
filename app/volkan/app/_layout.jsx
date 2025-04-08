import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  return (
    <>

      <Stack
        screenOptions={{
          headerShown: false,
          title: '',
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            title: '',
            headerTitle: '',
          }}
        />
        <Stack.Screen
          name="GameDetailScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NewsDetailScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CategoryScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditProfileScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AccountScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NotificationsSettingsScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LanguageScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SecurityScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TermsAndConditionsScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PrivacyPolicyScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HelpScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="InviteFriendScreen"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}
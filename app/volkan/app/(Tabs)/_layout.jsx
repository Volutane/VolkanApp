import { Tabs } from 'expo-router';
import TabBar from '../../components/TabBar';

export default function Layout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false, 
        tabBarStyle: [
          'GameDetailScreen',
          'NewsDetailScreen',
          'CategoryScreen',
          'EditProfileScreen',
          'Settings',
          'AccountScreen',
          'NotificationsSettingsScreen',
          'LanguageScreen',
          'SecurityScreen',
          'TermsAndConditionsScreen',
          'PrivacyPolicyScreen',
          'HelpScreen',
          'InviteFriendScreen',
        ].includes(route.name)
          ? { display: 'none' }
          : { display: 'flex' },
      })}
    >
      <Tabs.Screen name="home" options={{ title: '' }} />
      <Tabs.Screen name="search" options={{ title: '' }} />
      <Tabs.Screen name="news" options={{ title: '' }} />
      <Tabs.Screen name="notification" options={{ title: '' }} />
      <Tabs.Screen name="profile" options={{ title: '' }} />
    </Tabs>
  );
}
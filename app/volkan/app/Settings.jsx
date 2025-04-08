import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Dimensions, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const { width, height } = Dimensions.get('window');

const Settings = () => {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lightModeEnabled, setLightModeEnabled] = useState(false);

  const settingsData = [
    { id: '1', title: 'Account', icon: 'person', route: '/AccountScreen' },
    { id: '2', title: 'Notifications', icon: 'notifications', hasSwitch: true, switchValue: notificationsEnabled, onSwitchChange: setNotificationsEnabled },
    { id: '3', title: 'Light Mode', icon: 'sunny', hasSwitch: true, switchValue: lightModeEnabled, onSwitchChange: setLightModeEnabled },
    { id: '4', title: 'Language', icon: 'language', route: '/LanguageScreen' },
    { id: '5', title: 'Security', icon: 'lock-closed', route: '/SecurityScreen' },
    { id: '6', title: 'Terms & Conditions', icon: 'document-text', route: '/TermsAndConditionsScreen' },
    { id: '7', title: 'Privacy Policy', icon: 'shield', route: '/PrivacyPolicyScreen' },
    { id: '8', title: 'Help', icon: 'help-circle', route: '/HelpScreen' },
    { id: '9', title: 'Invite a Friend', icon: 'person-add', route: '/InviteFriendScreen' },
    { id: '10', title: 'Logout', icon: 'log-out', action: 'logout' },
  ];

  const handleItemPress = (item) => {
    if (item.route) {
      router.push(item.route);
    } else if (item.action === 'logout') {
      
      console.log('Logout pressed');
      
      router.push('/(tabs)/home');
    }
  };

  const renderSettingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => handleItemPress(item)}
      disabled={item.hasSwitch} 
    >
      <View style={styles.itemContent}>
        <Ionicons name={item.icon} size={24} color="white" style={styles.icon} />
        <Text style={styles.itemText}>{item.title}</Text>
      </View>
      {item.hasSwitch ? (
        <Switch
          value={item.switchValue}
          onValueChange={item.onSwitchChange}
          trackColor={{ false: '#767577', true: '#00FF00' }}
          thumbColor={item.switchValue ? '#f4f3f4' : '#f4f3f4'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={24} color="#A9A9A9" />
      )}
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../assets/images/Katman.png')}
      style={[styles.container, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Settings</Text>
        </View>

        
        <FlatList
          data={settingsData}
          renderItem={renderSettingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    opacity: 0.3,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  listContainer: {
    paddingBottom: 100,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  itemText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Settings;
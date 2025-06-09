import { View, Text, ImageBackground, StyleSheet, Dimensions, Switch, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';

const { width, height } = Dimensions.get('window');

const SecurityScreen = () => {
  const router = useRouter();
  const { colors, backgroundImage } = useContext(ThemeContext);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  return (
    <ImageBackground
      source={backgroundImage}
      style={[styles.container, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerText, { color: colors.text }]}>Security</Text>
          </View>
          <View style={[styles.settingsCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.settingItem}>
              <Text style={[styles.settingText, { color: colors.text }]}>Two-Factor Authentication</Text>
              <Switch
                value={twoFactorAuth}
                onValueChange={setTwoFactorAuth}
                trackColor={{ false: '#767577', true: '#00FF00' }}
                thumbColor={twoFactorAuth ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
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
  safeArea: {
    flex: 1,
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
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  settingsCard: {
    borderRadius: 10,
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SecurityScreen;
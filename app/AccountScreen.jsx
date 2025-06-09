import { View, Text, ImageBackground, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';

const { width, height } = Dimensions.get('window');

const AccountScreen = () => {
  const router = useRouter();
  const { colors, backgroundImage } = useContext(ThemeContext);

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
            <Text style={[styles.headerText, { color: colors.text }]}>Account</Text>
          </View>
          <View style={[styles.accountCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.label, { color: colors.text }]}>Username</Text>
            <Text style={[styles.value, { color: colors.secondaryText }]}>User Name</Text>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <Text style={[styles.value, { color: colors.secondaryText }]}>user@example.com</Text>
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
  accountCard: {
    borderRadius: 10,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default AccountScreen;
import { View, Text, ImageBackground, StyleSheet, ScrollView, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';

const { width, height } = Dimensions.get('window');

const HelpScreen = () => {
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
            <Text style={[styles.headerText, { color: colors.text }]}>Help</Text>
          </View>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>1. How to Use the App</Text>
            <Text style={[styles.sectionContent, { color: colors.text }]}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Contact Support</Text>
            <Text style={[styles.sectionContent, { color: colors.text }]}>
              If you need further assistance, please contact us at support@example.com.
            </Text>
          </ScrollView>
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
  scrollContent: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
});

export default HelpScreen;
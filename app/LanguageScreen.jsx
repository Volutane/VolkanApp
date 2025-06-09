import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';

const { width, height } = Dimensions.get('window');

const LanguageScreen = () => {
  const router = useRouter();
  const { colors, backgroundImage } = useContext(ThemeContext);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const languages = [
    { id: '1', name: 'English' },
    { id: '2', name: 'Spanish' },
    { id: '3', name: 'French' },
    { id: '4', name: 'German' },
  ];

  const renderLanguage = ({ item }) => (
    <TouchableOpacity
      style={[styles.languageItem, { backgroundColor: colors.cardBackground }]}
      onPress={() => setSelectedLanguage(item.name)}
    >
      <Text style={[styles.languageText, { color: colors.text }]}>{item.name}</Text>
      {selectedLanguage === item.name && (
        <Ionicons name="checkmark" size={24} color={colors.text} />
      )}
    </TouchableOpacity>
  );

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
            <Text style={[styles.headerText, { color: colors.text }]}>Language</Text>
          </View>
          <FlatList
            data={languages}
            renderItem={renderLanguage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.languageList}
          />
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
  languageList: {
    paddingBottom: 100,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  languageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LanguageScreen;
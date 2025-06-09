import { View, Text, ImageBackground, StyleSheet, TextInput, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';

const { width, height } = Dimensions.get('window');

const EditProfileScreen = () => {
  const router = useRouter();
  const { colors, backgroundImage } = useContext(ThemeContext);
  const [name, setName] = useState('User Name');
  const [email, setEmail] = useState('user@example.com');

  const handleSave = () => {
    console.log('Profile updated:', { name, email });
    router.back();
  };

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
            <Text style={[styles.headerText, { color: colors.text }]}>Edit Profile</Text>
          </View>
          <View style={[styles.form, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.label, { color: colors.text }]}>Name</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.buttonBackground }]}
              value={name}
              onChangeText={setName}
            />
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.buttonBackground }]}
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.buttonBackground }]}
              onPress={handleSave}
            >
              <Text style={[styles.saveButtonText, { color: colors.buttonText }]}>Save</Text>
            </TouchableOpacity>
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
  form: {
    borderRadius: 10,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
import { View, Text, ImageBackground, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';

const NewDiscussionScreen = () => {
  const router = useRouter();
  const { colors, backgroundImage } = useContext(ThemeContext);

  // Form state'leri
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Genel'); 
  const [description, setDescription] = useState('');

  
  const categories = ['Genel', 'Strateji', 'Sorular', 'Hatalar'];

  
  const handleSubmit = () => {
    if (!title || !description) {
      alert('Please fill in all fields.');
      return;
    }

    const newThread = {
      id: String(Date.now()), 
      gameId: 'general', 
      gameName: 'General Discussion',
      title,
      category,
      user: 'Player1', 
      date: new Date().toISOString().split('T')[0], 
      likes: 0,
      comments: [],
    };

    
    alert('Discussion posted successfully!');
    router.back(); 
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerText, { color: colors.text }]}>New Discussion</Text>
            <View style={{ width: 24 }} /> 
          </View>

          
          <ScrollView contentContainerStyle={styles.formContainer}>
            
            <Text style={[styles.label, { color: colors.text }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
              placeholder="Enter discussion title..."
              placeholderTextColor={colors.secondaryText}
              value={title}
              onChangeText={setTitle}
            />

            
            <Text style={[styles.label, { color: colors.text }]}>Category</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.categoryButton,
                    category === cat && { backgroundColor: colors.buttonBackground },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat ? { color: colors.buttonText } : { color: colors.text },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.cardBackground, color: colors.text }]}
              placeholder="Enter your discussion details..."
              placeholderTextColor={colors.secondaryText}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
            />

            
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitButton, { backgroundColor: colors.buttonBackground }]}
            >
              <Text style={[styles.submitButtonText, { color: colors.buttonText }]}>Post Discussion</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    opacity: 0.3,
  },
  safeArea: {
    flex: 1,
    paddingBottom: 0,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    paddingBottom: 60,
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
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryButtonText: {
    fontSize: 14,
  },
  textArea: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NewDiscussionScreen;
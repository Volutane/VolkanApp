import { View, Text, ImageBackground, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const NewsDetailScreen = () => {
  const router = useRouter();
  const { news } = useLocalSearchParams();
  const parsedNews = news ? JSON.parse(news) : { title: 'News Title', date: 'Apr 25, 2022' };

  return (
    <ImageBackground
      source={require('../assets/images/Katman.png')}
      style={[styles.container, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>News Detail</Text>
        </View>
        <Text style={styles.title}>{parsedNews.title}</Text>
        <Text style={styles.date}>{parsedNews.date}</Text>
        <Text style={styles.description}>This is the news detail screen for {parsedNews.title}.</Text>
      </ScrollView>
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
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  date: {
    color: '#A9A9A9',
    fontSize: 14,
    marginBottom: 20,
  },
  description: {
    color: 'white',
    fontSize: 16,
  },
});

export default NewsDetailScreen;

import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useContext } from 'react';
import { ThemeContext } from '../components/ThemeContext';

const { width, height } = Dimensions.get('window');

const NewsDetailScreen = () => {
  const router = useRouter();
  const { giveaway } = useLocalSearchParams();
  const { colors, backgroundImage } = useContext(ThemeContext);

  // Parametreden gelen giveaway verisini parse et
  const newsItem = JSON.parse(giveaway);

  return (
    <ImageBackground
      source={backgroundImage}
      style={[styles.container, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Geri Dön Butonu */}
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: "transparent" }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: '#00FF00' }]}>Back</Text>
        </TouchableOpacity>

        {/* Haber Görseli */}
        {newsItem.image && (
          <Image
            source={{ uri: newsItem.image }}
            style={styles.newsImage}
            resizeMode="cover"
            defaultSource={require('../assets/images/ay.jpg')}
          />
        )}

        {/* Haber Başlığı */}
        <Text style={[styles.newsTitle, { color: colors.text }]}>{newsItem.title}</Text>

        {/* Tarih ve Kaynak */}
        <View style={styles.metaContainer}>
          <Text style={[styles.newsDate, { color: colors.secondaryText }]}>{newsItem.date}</Text>
          <Text style={[styles.newsSource, { color: colors.secondaryText }]}>{newsItem.platforms}</Text>
        </View>

        {/* Haber İçeriği */}
        <Text style={[styles.newsContent, { color: colors.text }]}>
          {newsItem.rawData.description || newsItem.rawData.content || 'No additional content available.'}
        </Text>
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
    paddingBottom: 100,
  },
  backButton: {
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 23,
    fontWeight: 'bold',
  },
  newsImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  newsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  newsDate: {
    fontSize: 14,
  },
  newsSource: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  newsContent: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default NewsDetailScreen;

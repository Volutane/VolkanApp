import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../components/ThemeContext';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const News = () => {
  const router = useRouter();
  const { colors, backgroundImage } = useContext(ThemeContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const [trendingGiveaways, setTrendingGiveaways] = useState([]);
  const [regularGiveaways, setRegularGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async () => {
    try {
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          category: 'technology',
          country: 'us',
          pageSize: 20,
          apiKey: 'b7064756a9a14bdeaa63bcf33ecb5c73',
        },
      });

      const articles = response.data.articles;

      const trending = articles.slice(0, 5).map((item, index) => ({
        id: index.toString(),
        label: `#${index + 1} Trending`,
        title: item.title,
        date: new Date(item.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        worth: '',
        image: item.urlToImage,
        platforms: item.source.name,
        type: 'News',
        rawData: item,
      }));

      const regular = articles.slice(5, 15).map((item, index) => ({
        id: (index + 5).toString(),
        title: item.title,
        date: new Date(item.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        worth: '',
        color: colors.cardBackground,
        image: item.urlToImage,
        platforms: item.source.name,
        type: 'News',
        rawData: item,
      }));

      setTrendingGiveaways(trending);
      setRegularGiveaways(regular);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (width - 40));
    setActiveIndex(index);
  };

  const renderTrendingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.trendingBanner}
      onPress={() =>
        router.push({ pathname: '/NewsDetailScreen', params: { giveaway: JSON.stringify(item) } })
      }
    >
      <Image
        source={{ uri: item.image }}
        style={styles.trendingImage}
        resizeMode="cover"
        defaultSource={require('../../assets/images/ay.jpg')}
      />
      <View style={styles.trendingOverlay}>
        <Text style={[styles.trendingLabel, { color: colors.accent }]}>{item.label}</Text>
        <Text style={[styles.trendingText, { color: colors.bannerText }]}>{item.title}</Text>
        <Text style={[styles.trendingDate, { color: colors.secondaryText }]}>{item.date}</Text>
        <Text style={[styles.trendingPlatforms, { color: colors.secondaryText }]}>{item.platforms}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRegularItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.newsCard, { backgroundColor: item.color }]}
      onPress={() =>
        router.push({ pathname: '/NewsDetailScreen', params: { giveaway: JSON.stringify(item) } })
      }
    >
      <Image
        source={{ uri: item.image }}
        style={styles.newsImage}
        resizeMode="cover"
        defaultSource={require('../../assets/images/ay.jpg')}
      />
      <View style={styles.newsContent}>
        <Text style={[styles.newsTitle, { color: colors.text }]}>{item.type.toUpperCase()}</Text>
        <Text style={[styles.newsText, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.newsDate, { color: colors.secondaryText }]}>{item.date}</Text>
        <Text style={[styles.newsPlatforms, { color: colors.secondaryText }]}>{item.platforms}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ImageBackground source={backgroundImage} style={[styles.container, styles.centerContainer]}>
        <View style={styles.overlay} />
        <ActivityIndicator size="large" color={colors.accent} />
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground source={backgroundImage} style={[styles.container, styles.centerContainer]}>
        <View style={styles.overlay} />
        <Text style={[styles.errorText, { color: colors.text }]}>Error loading news: {error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.accent }]} onPress={fetchNews}>
          <Text style={[styles.retryButtonText, { color: colors.buttonText }]}>Retry</Text>
        </TouchableOpacity>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={backgroundImage} style={[styles.container, { width, height }]}>
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: colors.text }]}>News</Text>
        </View>

        <FlatList
          data={trendingGiveaways}
          renderItem={renderTrendingItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.trendingList}
        />
        <View style={styles.dotsContainer}>
          {trendingGiveaways.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === activeIndex ? colors.accent : colors.secondaryText },
              ]}
            />
          ))}
        </View>

        <FlatList
          data={regularGiveaways}
          renderItem={renderRegularItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.newsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          ListHeaderComponent={
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest News</Text>
          }
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No news available</Text>
          }
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { justifyContent: 'center', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'black', opacity: 0.3 },
  content: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerText: { fontSize: 24, fontWeight: 'bold' },
  trendingList: { paddingBottom: 200 },
  trendingBanner: {
    width: width - 55,
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 15,
    marginLeft:3,
    marginBottom:25,
    position: 'relative',
  },
  trendingImage: { width: '100%', height: '100%' },
  trendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: 15,
  },
  trendingLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  trendingText: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  trendingDate: { fontSize: 12, marginBottom: 5 },
  trendingPlatforms: { fontSize: 12, fontStyle: 'italic' },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  newsList: { paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  newsCard: {
    width: '100%',
    minHeight: 120,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsImage: { width: 80, height: 80, borderRadius: 10, marginRight: 15 },
  newsContent: { flex: 1 },
  newsTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  newsText: { fontSize: 14, marginBottom: 5 },
  newsDate: { fontSize: 10, marginBottom: 2 },
  newsPlatforms: { fontSize: 10, fontStyle: 'italic' },
  emptyText: { textAlign: 'center', marginTop: 20 },
  errorText: { fontSize: 16, marginBottom: 20, textAlign: 'center', paddingHorizontal: 20 },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5 },
  retryButtonText: { fontWeight: 'bold' },
});

export default News;

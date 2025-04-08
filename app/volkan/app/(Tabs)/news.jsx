import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

const { width, height } = Dimensions.get('window');

const News = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const trendingNews = [
    {
      id: '1',
      label: '#1 Trending',
      title: 'America is preparing to host GameFest and...',
      date: 'Apr 25, 2022',
      image: require('../../assets/images/ay.jpg'),
    },
    {
      id: '2',
      label: '#2 Trending',
      title: 'New game release announced for 2023...',
      date: 'Apr 24, 2022',
      image: require('../../assets/images/ay.jpg'),
    },
    {
      id: '3',
      label: '#3 Trending',
      title: 'GameFest 2023 tickets now available...',
      date: 'Apr 23, 2022',
      image: require('../../assets/images/ay.jpg'),
    },
  ];

  const newsData = [
    {
      id: '1',
      title: 'gygcykgcuvgykhgvukucu chkgcykgckghc',
      date: 'Apr 25, 2022',
      color: '#FF4D4D',
      image: require('../../assets/images/icon.png'),
    },
    {
      id: '2',
      title: 'bvrfbvbdabdhbfvdfnvdfbfvd kvksfbvfbvjsfkbfvdk',
      date: 'Apr 24, 2022',
      color: '#00CC00',
      image: require('../../assets/images/icon.png'),
    },
    {
      id: '3',
      title: 'bvrfbvbdabdhbfvdfnvdf bvrfbvjsfkbfvjbiks',
      date: 'Apr 25, 2022',
      color: '#800080',
      image: require('../../assets/images/icon.png'),
    },
    {
      id: '4',
      title: 'LIFESTYLE bvrfbvbdabdhbfvdfnvdfbfvd',
      date: 'Apr 25, 2022',
      color: '#FFD1DC',
      image: require('../../assets/images/icon.png'),
    },
  ];

  const renderTrendingNews = ({ item }) => (
    <TouchableOpacity
      style={styles.trendingBanner}
      onPress={() => router.push({ pathname: '/NewsDetailScreen', params: { news: JSON.stringify(item) } })}
    >
      <Image source={item.image} style={styles.trendingImage} resizeMode="cover" />
      <View style={styles.trendingOverlay}>
        <Text style={styles.trendingLabel}>{item.label}</Text>
        <Text style={styles.trendingText}>{item.title}</Text>
        <Text style={styles.trendingDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.newsCard, { backgroundColor: item.color }]}
      onPress={() => router.push({ pathname: '/NewsDetailScreen', params: { news: JSON.stringify(item) } })}
    >
      <Image source={item.image} style={styles.newsImage} resizeMode="cover" />
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>XXXX</Text>
        <Text style={styles.newsText} numberOfLines={2} ellipsizeMode="tail">
          {item.title}
        </Text>
        <Text style={styles.newsDate}>{item.date}</Text>
        <Text style={styles.readMore}>...</Text>
      </View>
    </TouchableOpacity>
  );

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActiveIndex(index);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/Katman.png')}
      style={[styles.container, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.headerText}>News</Text>
        </View>

        
        <FlatList
          data={trendingNews}
          renderItem={renderTrendingNews}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.trendingList}
        />
        <View style={styles.dotsContainer}>
          {trendingNews.map((_, index) => (
            <View key={index} style={[styles.dot, index === activeIndex && styles.activeDot]} />
          ))}
        </View>
        <FlatList
          data={newsData}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.newsList}
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
  },
  trendingList: {
    paddingBottom: 20,
  },
  trendingBanner: {
    width: width - 40,
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 15,
    position: 'relative',
    right: 15,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: 15,
  },
  trendingLabel: {
    color: '#00FF00',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    left: 10,
  },
  trendingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    left: 10,
  },
  trendingDate: {
    color: '#A9A9A9',
    fontSize: 12,
    marginBottom: 45,
    left: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A9A9A9',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#00FF00',
  },
  newsList: {
    paddingBottom: 100,
  },
  newsCard: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  newsText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  newsDate: {
    color: '#A9A9A9',
    fontSize: 12,
  },
  readMore: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});

export default News;
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../components/ThemeContext';

const { width, height } = Dimensions.get('window');

const fetchIgdbToken = async (clientId, clientSecret) => {
  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: 'POST' }
  );
  const data = await response.json();
  return data.access_token;
};

const fetchGamesFromIGDB = async (
  accessToken,
  clientId,
  searchTerm = '',
  sortBy = 'rating',
  filterByRecent = false,
  limit = 100
) => {
  const now = Math.floor(Date.now() / 1000);
  const oneMonthAgo = now - 60 * 24 * 60 * 60;

  const whereClauses = [];

  if (searchTerm) {
    whereClauses.push(`name ~ *"${searchTerm}"*`);
  }

  if (filterByRecent) {
    whereClauses.push(`first_release_date >= ${oneMonthAgo} & first_release_date <= ${now}`);
    whereClauses.push(`total_rating_count > 7`);
  }

  const query = `
    fields name, cover.url, rating, genres.name, summary, first_release_date, total_rating_count;
    ${whereClauses.length ? `where ${whereClauses.join(' & ')};` : ''}
    sort ${sortBy} desc;
    limit ${limit};
  `;

  const res = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    body: query,
  });

  const data = await res.json();
  return data;
};

const Home = () => {
  const router = useRouter();
  const { colors, backgroundImage, isLightMode } = useContext(ThemeContext);

  const CLIENT_ID = 'z9muc6maorsvxnxxf33ooyq8yw68s7';
  const CLIENT_SECRET = 'vl8zon2et6hl53tj7a37ziz01t0f7q';

  const [popularGames, setPopularGames] = useState([]);
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [trendingGames, setTrendingGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const accessToken = await fetchIgdbToken(CLIENT_ID, CLIENT_SECRET);

        // Fetch popular games
        const popularData = await fetchGamesFromIGDB(
          accessToken,
          CLIENT_ID,
          '',
          'total_rating_count',
          true
        );
        setPopularGames(popularData);

        // Fetch recommended games with variety
        const [popularData2, recentData, hypedData] = await Promise.all([
          fetchGamesFromIGDB(accessToken, CLIENT_ID, '', 'popularity', false, 50),
          fetchGamesFromIGDB(accessToken, CLIENT_ID, '', 'first_release_date', false, 50),
          fetchGamesFromIGDB(accessToken, CLIENT_ID, '', 'hypes', false, 50)
        ]);

        // Combine and deduplicate games
        const allGames = [...popularData2, ...recentData, ...hypedData];
        const uniqueGames = Array.from(new Map(allGames.map(game => [game.id, game])).values());
        
        // Shuffle and limit to 30 games
        const shuffled = uniqueGames.sort(() => 0.5 - Math.random());
        setRecommendedGames(shuffled.slice(0, 30));

        // Fetch trending games
        const trendingData = await fetchGamesFromIGDB(
          accessToken,
          CLIENT_ID,
          '',
          'hypes'
        );
        setTrendingGames(trendingData);

        setError(null);
      } catch (err) {
        setError('Failed to load games from IGDB');
        console.error('IGDB Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const renderPopularGame = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/GameDetailScreen',
          params: { game: JSON.stringify(item) },
        })
      }
      style={styles.popularCard}
    >
      <Image
        source={{
          uri: item.cover
            ? `https:${item.cover.url.replace('t_thumb', 't_1080p')}`
            : 'https://via.placeholder.com/120',
        }}
        style={styles.popularImage}
        resizeMode="cover"
      />
      {item.rating && (
        <View style={styles.ratingContainer}>
          <Text style={[styles.ratingText, { color: colors.text }]}>
            {(item.rating / 10).toFixed(1)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderRecommendedGame = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/GameDetailScreen',
          params: { game: JSON.stringify(item) },
        })
      }
      style={[styles.recommendedCard, { backgroundColor: colors.cardBackground }]}
    >
      <Image
        source={{
          uri: item.cover
            ? `https:${item.cover.url.replace('t_thumb', 't_1080p')}`
            : 'https://via.placeholder.com/150',
        }}
        style={styles.recommendedImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderTrendingGame = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/GameDetailScreen',
          params: { game: JSON.stringify(item) },
        })
      }
      style={styles.popularCard}
    >
      <Image
        source={{
          uri: item.cover
            ? `https:${item.cover.url.replace('t_thumb', 't_1080p')}`
            : 'https://via.placeholder.com/120',
        }}
        style={styles.popularImage}
        resizeMode="cover"
      />
      {item.rating && (
        <View style={styles.ratingContainer}>
          <Text style={[styles.ratingText, { color: colors.text }]}>
            {(item.rating / 10).toFixed(1)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text }]}>Home</Text>
        <TouchableOpacity
          onPress={() => router.push('/Community')}
          style={styles.communityButton}
        >
          <Ionicons name="people" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.greetingText, { color: colors.text }]}>
        Hi Gamer 👾
      </Text>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Popular Games
        </Text>
        <TouchableOpacity onPress={() => router.push('/GamesScreen')}>
          <Text style={[styles.seeMoreText, { color: colors.secondaryText }]}>
            See More
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={popularGames}
        renderItem={renderPopularGame}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularList}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No popular games available
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.banner}
        onPress={() =>
          router.push({
            pathname: '/CategoryScreen',
            params: { category: 'Space/Universe' },
          })
        }
      >
        <Image
          source={require('../../assets/images/ay.jpg')}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay}>
          <Text style={[styles.bannerText, { color: colors.bannerText }]}>
            Best Games About Space/Universe
          </Text>
          <TouchableOpacity
            style={[styles.discoverButton, { backgroundColor: colors.buttonBackground }]}
          >
            <Text
              style={[styles.discoverButtonText, { color: colors.buttonText }]}
            >
              Discover
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Games you might like
        </Text>
        <TouchableOpacity>
          <Text style={[styles.seeMoreText, { color: colors.secondaryText }]}>
            See More
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={recommendedGames}
        renderItem={renderRecommendedGame}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularList}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No recommended games available
          </Text>
        }
      />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Trending Now
        </Text>
        <TouchableOpacity>
          <Text style={[styles.seeMoreText, { color: colors.secondaryText }]}>
            See More
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={trendingGames}
        renderItem={renderTrendingGame}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularList}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No trending games available
          </Text>
        }
      />

      <View style={styles.socialMediaBanner}>
        <Text style={[styles.socialMediaTitle, { color: colors.text }]}>
          Follow Us
        </Text>
        <View style={styles.socialMediaLinks}>
          <TouchableOpacity style={styles.socialMediaButton}>
            <Ionicons name="logo-twitter" size={24} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialMediaButton}>
            <Ionicons name="logo-instagram" size={24} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialMediaButton}>
            <Ionicons name="logo-youtube" size={24} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialMediaButton}>
            <Ionicons name="logo-discord" size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={backgroundImage || { uri: 'https://via.placeholder.com/1080x1920' }}
      style={[styles.container, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.accent }]}
              onPress={() => router.replace('/')}
            >
              <Text style={[styles.retryButtonText, { color: colors.buttonText }]}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={[1]}
            renderItem={() => null}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mainList}
          />
        )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  communityButton: {
    padding: 5,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeMoreText: {
    fontSize: 14,
  },
  popularList: {
    paddingBottom: 15,
  },
  popularCard: {
    width: 120,
    height: 180,
    marginRight: 10,
    marginBottom: 0,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  popularImage: {
    width: '100%',
    height: '100%',
  },
  ratingContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
    padding: 5,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  banner: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  bannerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  discoverButton: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  discoverButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  recommendedList: {
    paddingBottom: 20,
  },
  recommendedCard: {
    width: 120,
    height: 180,
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
  },
  recommendedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 5,
  },
  recommendedText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  recommendedRating: {
    fontSize: 12,
    marginTop: 2,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  mainList: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  releaseDateContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
    padding: 5,
  },
  releaseDateText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  specialOfferBanner: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 20,
    position: 'relative',
  },
  specialOfferImage: {
    width: '100%',
    height: '100%',
  },
  specialOfferOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  specialOfferTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  specialOfferSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  specialOfferButton: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  specialOfferButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialMediaBanner: {
    marginTop: 30,
    marginBottom: 20,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    alignItems: 'center',
  },
  socialMediaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  socialMediaLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialMediaButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
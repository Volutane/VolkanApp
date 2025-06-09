import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';
import axios from 'axios';


const fetchIgdbToken = async (clientId, clientSecret) => {
  try {
    const response = await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
    );
    console.log('Token Response:', response.data);
    return response.data.access_token;
  } catch (err) {
    console.error('IGDB Token Error:', err.message, err.response?.data);
    throw err;
  }
};


const fetchGamesFromIGDB = async (accessToken, clientId, sortBy = 'total_rating', genreFilter = 'All', platformFilter = 'All') => {
  const genreMap = {
    Action: 31,
    RPG: 12,
    Sports: 14,
    Social: 33,
    Strategy: 15,
  };
  const platformMap = {
    PC: 6,
    PS: 48,
    Xbox: 49,
  };

  const genreCondition = genreFilter !== 'All' ? `genres = (${genreMap[genreFilter]})` : '';
  const platformCondition = platformFilter !== 'All' ? `platforms = (${platformMap[platformFilter]})` : '';
  const whereConditions = [genreCondition, platformCondition].filter(Boolean).join(' & ') || 'total_rating != null';

  const sortField = sortBy === 'total_rating' ? 'total_rating desc' : sortBy === 'a-z' ? 'name asc' : 'name desc';

  const query = `
    fields id, name, cover.url, rating, genres.name, platforms.name, summary, total_rating;
    where ${whereConditions};
    sort ${sortField};
    limit 20;
  `;

  try {
    const response = await axios.post('https://api.igdb.com/v4/games', query, {
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'text/plain',
      },
    });
    console.log(`Games Response (sort: ${sortBy}, genre: ${genreFilter}, platform: ${platformFilter}):`, response.data);
    return response.data;
  } catch (err) {
    console.error('IGDB Fetch Games Error:', err.message, err.response?.data);
    throw err;
  }
};

const GamesScreen = () => {
  const router = useRouter();
  const { colors, backgroundImage } = useContext(ThemeContext);

  const CLIENT_ID = 'z9muc6maorsvxnxxf33ooyq8yw68s7';
  const CLIENT_SECRET = 'vl8zon2et6hl53tj7a37ziz01t0f7q';

  
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('total_rating');
  const [genreFilter, setGenreFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');

  
  const genres = ['All', 'Action', 'RPG', 'Sports', 'Social', 'Strategy'];
  const platforms = ['All', 'PC', 'PS', 'Xbox'];
  const sortOptions = [
    { label: 'Popularity', value: 'total_rating' },
    { label: 'A-Z', value: 'a-z' },
    { label: 'Z-A', value: 'z-a' },
  ];

  
  const fetchGames = async () => {
    try {
      setLoading(true);
      const accessToken = await fetchIgdbToken(CLIENT_ID, CLIENT_SECRET);
      const data = await fetchGamesFromIGDB(accessToken, CLIENT_ID, sortBy, genreFilter, platformFilter);
      console.log('Fetched Games:', data);
      setGames(data);
      setError(null);
    } catch (err) {
      setError('Unable to load games. Please try again later.');
      console.error('Fetch Games Error:', err.message, err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [sortBy, genreFilter, platformFilter]);

  const renderGame = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/GameDetailScreen', params: { game: JSON.stringify(item) } })}
      style={[styles.gameCard, { backgroundColor: colors.cardBackground }]}
    >
      <Image
        source={{ 
          uri: item.cover 
            ? `https:${item.cover.url.replace('t_thumb', 't_1080p')}`
            : 'https://via.placeholder.com/120'
        }}
        style={styles.gameImage}
        resizeMode="cover"
      />
      {item.total_rating && (
        <View style={styles.ratingContainer}>
          <Text style={[styles.ratingText, { color: colors.text }]}>
            {(item.total_rating / 10).toFixed(1)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

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
            <Text style={[styles.headerText, { color: colors.text }]}>Games</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Sort By</Text>
              <View style={styles.filterOptions}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSortBy(option.value)}
                    style={[
                      styles.filterButton,
                      sortBy === option.value ? { backgroundColor: colors.buttonBackground } : {},
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        sortBy === option.value ? { color: colors.buttonText } : { color: colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Genre</Text>
              <View style={styles.filterOptions}>
                {genres.map((genre) => (
                  <TouchableOpacity
                    key={genre}
                    onPress={() => setGenreFilter(genre)}
                    style={[
                      styles.filterButton,
                      genreFilter === genre ? { backgroundColor: colors.buttonBackground } : {},
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        genreFilter === genre ? { color: colors.buttonText } : { color: colors.text },
                      ]}
                    >
                      {genre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Platform</Text>
              <View style={styles.filterOptions}>
                {platforms.map((platform) => (
                  <TouchableOpacity
                    key={platform}
                    onPress={() => setPlatformFilter(platform)}
                    style={[
                      styles.filterButton,
                      platformFilter === platform ? { backgroundColor: colors.buttonBackground } : {},
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        platformFilter === platform ? { color: colors.buttonText } : { color: colors.text },
                      ]}
                    >
                      {platform}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: colors.accent }]}
                onPress={fetchGames}
              >
                <Text style={[styles.retryButtonText, { color: colors.buttonText }]}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={games}
              renderItem={renderGame}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              key="2-columns"
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.gameList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.text }]}>No games found.</Text>
              }
            />
          )}
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
  filterContainer: {
    marginBottom: 20,
  },
  filterContent: {
    paddingRight: 20,
  },
  filterSection: {
    marginRight: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterButtonText: {
    fontSize: 14,
  },
  gameList: {
    paddingBottom: 80,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  gameCard: {
    width: '48%',
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    position: 'relative',
  },
  gameImage: {
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
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default GamesScreen;
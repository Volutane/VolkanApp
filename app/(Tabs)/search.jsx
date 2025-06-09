import { View, Text, ImageBackground, StyleSheet, TextInput, FlatList, TouchableOpacity, Dimensions, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../components/ThemeContext';

const { width, height } = Dimensions.get('window');

const getGameTypeLabel = (game) => {
  if (!game) return null;
  
  // Category values from IGDB API
  const categories = {
    0: 'main_game',
    1: 'dlc',
    2: 'expansion',
    3: 'bundle',
    4: 'standalone_expansion',
    5: 'mod',
    6: 'episode',
    7: 'season',
    8: 'remake',
    9: 'remaster',
    10: 'expanded_game',
    11: 'port',
    12: 'fork',
    13: 'pack',
    14: 'update'
  };

  const category = categories[game.category];
  if (!category) return null;

  // Map category to display label
  const labelMap = {
    'dlc': 'DLC',
    'expansion': 'Expansion',
    'bundle': 'Bundle',
    'standalone_expansion': 'Standalone',
    'mod': 'Mod',
    'episode': 'Episode',
    'season': 'Season',
    'remake': 'Remake',
    'remaster': 'Remaster',
    'expanded_game': 'Expanded',
    'port': 'Port',
    'fork': 'Fork',
    'pack': 'Pack',
    'update': 'Update'
  };

  return labelMap[category] || null;
};

const CLIENT_ID = '9dtyg57eblultxa0ic0124294ux0wi';
const CLIENT_SECRET = 'zj44amb3l2wa249yzla7iblydjbhnu'; 

const Search = () => {
  const { colors, backgroundImage } = useContext(ThemeContext);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  
  const fetchIgdbToken = async () => {
    try {
      const response = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
        { method: 'POST' }
      );
      const data = await response.json();
      if (data.access_token) {
        console.log('Fetched Access Token:', data.access_token);
        setAccessToken(data.access_token);
        return data.access_token;
      } else {
        throw new Error('Failed to fetch access token');
      }
    } catch (err) {
      console.error('IGDB Token Error:', err);
      throw err;
    }
  };

  
  const fetchSuggestedGames = async (token) => {
    setLoading(true);
    try {
      const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'text/plain',
        },
        body: `fields name, cover.url, first_release_date, category; sort total_rating desc; limit 20;`,
      });
      console.log('Suggested Games Response Status:', response.status);
      const data = await response.json();
      if (response.ok) {
        setGames(data);
        console.log('Suggested Games:', data);
      } else {
        console.error('Suggested Games Error:', data);
        setGames([]);
      }
    } catch (error) {
      console.error('IGDB fetch suggested games error:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await fetchIgdbToken();
        await fetchSuggestedGames(token);
      } catch (err) {
        console.error('Initialization Error:', err);
      }
    };
    initialize();
  }, []);

  
  const handleSearch = async () => {
    if (!query) {
      setIsSearchActive(false);
      try {
        const token = accessToken || (await fetchIgdbToken());
        await fetchSuggestedGames(token);
      } catch (err) {
        console.error('Fetch Suggested Games Error:', err);
      }
      return;
    }

    setLoading(true);
    setIsSearchActive(true);

    try {
      const token = accessToken || (await fetchIgdbToken());
      const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'text/plain',
        },
        body: `search "${query}"; fields name, cover.url, first_release_date, category; limit 20;`,
      });
      console.log('Search Response Status:', response.status);
      const data = await response.json();
      if (response.ok) {
        setGames(data);
        console.log('Search Results:', data);
      } else {
        console.error('Search Error:', data);
        setGames([]);
      }
    } catch (error) {
      console.error('IGDB fetch error:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const getCoverUrl = (url) => {
    if (!url) return null;
    return `https:${url.replace('t_thumb', 't_cover_big')}`;
  };

  const renderItem = ({ item }) => {
    const gameType = getGameTypeLabel(item);
    
    return (
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/GameDetailScreen', params: { game: JSON.stringify(item) } })}
        style={styles.card}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: item.cover?.url 
                ? `https:${item.cover.url.replace('t_thumb', 't_1080p')}`
                : 'https://via.placeholder.com/120'
            }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          {gameType && (
            <View style={[styles.typeLabel, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
              <Text style={styles.typeLabelText}>{gameType}</Text>
            </View>
          )}
          {item.total_rating && (
            <View style={styles.ratingContainer}>
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {(item.total_rating / 10).toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={backgroundImage} style={[styles.container, { width, height }]} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={[styles.headerText, { color: colors.text }]}>Search</Text>
        <View style={[styles.searchContainer, { backgroundColor: colors.buttonBackground }]}>
          <Ionicons name="search" size={24} color={colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for games..."
            placeholderTextColor={colors.secondaryText}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#00ff00" style={{ marginTop: 30 }} />
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isSearchActive ? 'Search Results' : 'Suggested Games'}
            </Text>
            {games.length > 0 ? (
              <FlatList
                data={games}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              <Text style={[styles.errorText, { color: colors.text }]}>
                No games found. Please try again.
              </Text>
            )}
          </>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    opacity: 0.3,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  listContainer: {
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  card: {
    width: '48%',
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    position: 'relative',
  },
  cardImage: {
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
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  typeLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  typeLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Search;
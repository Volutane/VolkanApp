import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';

const CLIENT_ID = 'z9muc6maorsvxnxxf33ooyq8yw68s7';
const CLIENT_SECRET = 'vl8zon2et6hl53tj7a37ziz01t0f7q';

const fetchIgdbToken = async () => {
  try {
    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
      { method: 'POST' }
    );
    return (await response.json()).access_token;
  } catch (err) {
    console.error('IGDB Token Error:', err);
    throw err;
  }
};

const fetchGamesByTheme = async (accessToken, themeName) => {
  const query = `
    fields name, cover.url, rating, release_dates.human, platforms.name, category;
    where themes.name = "${themeName}";
    sort rating desc;
    limit 50;
  `;

  try {
    const res = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      body: query,
    });
    return await res.json();
  } catch (err) {
    console.error('IGDB Games Error:', err);
    throw err;
  }
};

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

const ThemeGamesScreen = () => {
  const router = useRouter();
  const { themeName } = useLocalSearchParams();
  const { colors, backgroundImage } = useContext(ThemeContext);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        const accessToken = await fetchIgdbToken();
        const data = await fetchGamesByTheme(accessToken, themeName);
        setGames(data);
      } catch (err) {
        setError('Failed to load games: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [themeName]);

  const renderGame = ({ item }) => {
    const gameType = getGameTypeLabel(item);
    
    return (
      <TouchableOpacity
        style={[styles.gameCard, { backgroundColor: colors.cardBackground }]}
        onPress={() => router.push({ pathname: '/GameDetailScreen', params: { game: JSON.stringify({ id: item.id, name: item.name }) } })}
      >
        <View style={styles.imageContainer}>
          <Image
            source={item.cover ? { uri: `https:${item.cover.url.replace('t_thumb', 't_1080p')}` } : require('../assets/images/icon.png')}
            style={styles.gameImage}
            resizeMode="cover"
          />
          {gameType && (
            <View style={[styles.typeLabel, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
              <Text style={styles.typeLabelText}>{gameType}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={backgroundImage || { uri: 'https://via.placeholder.com/1080x1920' }} style={styles.container} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{themeName} Games</Text>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.accent }]} onPress={() => router.back()}>
              <Text style={[styles.retryButtonText, { color: colors.buttonText }]}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={games}
            renderItem={renderGame}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.gamesList}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gamesList: {
    padding: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  gameCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gameImage: {
    width: '100%',
    aspectRatio: 2/3,
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
  imageContainer: {
    position: 'relative',
    width: '100%',
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

export default ThemeGamesScreen; 
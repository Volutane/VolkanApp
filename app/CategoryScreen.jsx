import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Dimensions, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';

const { width, height } = Dimensions.get('window');

const CategoryScreen = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const { colors, backgroundImage } = useContext(ThemeContext);

  const CLIENT_ID = 'z9muc6maorsvxnxxf33ooyq8yw68s7';
  const CLIENT_SECRET = 'vl8zon2et6hl53tj7a37ziz01t0f7q';

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardMargin = 10;
  const cardWidth = (width - 40 - cardMargin * 4) / 3;

  const fetchIgdbToken = async () => {
    try {
      const response = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
        { method: 'POST' }
      );
      const data = await response.json();
      return data.access_token;
    } catch (err) {
      console.error('IGDB Token Error:', err);
      throw err;
    }
  };

  const fetchSpaceGames = async (accessToken) => {
    try {
      const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Client-ID': CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        body: `
          search "space";
          fields id, name, cover.url;
          limit 50;
          offset 0;
        `,
      });
      const data = await response.json();
      return data.map(game => ({
        id: game.id.toString(),
        name: game.name,
        cover: game.cover ? `https:${game.cover.url.replace('t_thumb', 't_1080p')}` : null,
      }));
    } catch (err) {
      console.error('IGDB Games Error:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        const accessToken = await fetchIgdbToken();
        const spaceGames = await fetchSpaceGames(accessToken);
        setGames(spaceGames.slice(0, 51));
      } catch (err) {
        setError('Failed to load games: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, []);

  const renderGame = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        console.log('Navigating to GameDetailScreen with game:', { id: item.id, name: item.name });
        router.push({
          pathname: '/GameDetailScreen',
          params: { game: JSON.stringify({ id: item.id, name: item.name }) },
        });
      }}
      style={[styles.gameCard, { backgroundColor: colors.cardBackground }]}
    >
      <Image
        source={
          item.cover
            ? { uri: item.cover }
            : require('../assets/images/icon.png')
        }
        style={styles.gameImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

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
            <Text style={[styles.headerText, { color: colors.text }]}>{category || 'Space Themed Games'}</Text>
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: colors.accent }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.retryButtonText, { color: colors.buttonText }]}>Go Back</Text>
              </TouchableOpacity>
            </View>
          ) : games.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.text }]}>No games found for this category.</Text>
          ) : (
            <FlatList
              data={games}
              renderItem={renderGame}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.gameList}
              showsVerticalScrollIndicator={false}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameList: {
    paddingBottom: 60,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 5,
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
  gameText: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
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

export default CategoryScreen;
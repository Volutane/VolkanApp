import { View, Text, ImageBackground, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../components/ThemeContext';

const { width } = Dimensions.get('window');

const GameListScreen = () => {
  const router = useRouter();
  const { colors, backgroundImage } = useContext(ThemeContext);
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameList, setGameList] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const parseGames = () => {
      console.log('Starting to parse games data at', new Date().toLocaleTimeString());
      console.log('Raw params.games:', params.games);

      if (!params.games) {
        console.warn('No games parameter provided at', new Date().toLocaleTimeString());
        if (isMounted) {
          setError('No games data provided');
          setLoading(false);
        }
        return;
      }

      try {
        const gamesData = JSON.parse(params.games);
        console.log('Successfully parsed games data at', new Date().toLocaleTimeString(), ':', gamesData);

        if (isMounted && Array.isArray(gamesData)) {
          const formattedGames = gamesData.map(game => {
            // Log the original game data for debugging
            console.log('Processing game:', game);
            
            // Handle cover URL
            let coverUrl = null;
            if (game.cover) {
              // If the cover URL is already in the correct format, use it
              if (game.cover.includes('t_1080p')) {
                coverUrl = game.cover;
              } else {
                // Otherwise, try to convert it to the correct format
                coverUrl = game.cover.replace('t_cover_big', 't_1080p');
              }
            }
            
            console.log('Processed cover URL:', coverUrl);
            
            return {
              id: game.id || game.gameId || `game_${Math.random().toString(36).substr(2, 9)}`,
              name: game.name || 'Unknown Game',
              cover: coverUrl,
            };
          });
          console.log('Formatted games:', formattedGames);
          setGameList(formattedGames);
        } else if (isMounted) {
          console.warn('Parsed data is not an array at', new Date().toLocaleTimeString(), ':', gamesData);
          setError('Invalid games data format');
        }
      } catch (e) {
        if (isMounted) {
          console.error('Parse error at', new Date().toLocaleTimeString(), ':', e.message, 'Raw data:', params.games);
          setError(`Failed to parse games data: ${e.message}`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    parseGames();

    return () => {
      isMounted = false;
    };
  }, [params.games]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading games... Please wait.
        </Text>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.buttonBackground }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelButtonText, { color: colors.buttonText }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.buttonBackground }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.retryButtonText, { color: colors.buttonText }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.container} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: colors.text }]}>
            {params.type === 'Games' ? 'Played Games' : 'Wishlist'}
          </Text>
          <View style={styles.backButton} />
        </View>

        <FlatList
          data={gameList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => {
                console.log('Navigating to GameDetailScreen with:', item);
                try {
                  router.push({
                    pathname: '/GameDetailScreen',
                    params: { game: JSON.stringify({ id: item.id, name: item.name }) }
                  });
                } catch (err) {
                  console.error('Navigation error:', err);
                }
              }}
            >
              <Image
                source={item.cover ? { uri: item.cover } : require('../assets/images/icon.png')}
                style={styles.gameImage}
                resizeMode="cover"
                onError={(e) => console.error('Image loading error:', e.nativeEvent.error, 'for game:', item.name)}
              />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gameList}
          ListEmptyComponent={() => (
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {params.type === 'Games' ? 'No played games yet' : 'No games in wishlist'}
            </Text>
          )}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'black', opacity: 0.3 },
  content: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerText: { fontSize: 24, fontWeight: 'bold' },
  gameList: { paddingHorizontal: 10, paddingBottom: 100, paddingTop: 10 },
  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: 5 },
  gameCard: { width: (width - 40) / 2, aspectRatio: 2/3, marginBottom: 15, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(0, 0, 0, 0.2)' },
  gameImage: { width: '100%', height: '100%', borderRadius: 12 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, textAlign: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  retryButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25 },
  retryButtonText: { fontSize: 16, fontWeight: 'bold' },
  cancelButton: { marginTop: 20, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25 },
  cancelButtonText: { fontSize: 16, fontWeight: 'bold' },
});

export default GameListScreen;
import { View, Text, ImageBackground, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const GameDetailScreen = () => {
  const router = useRouter();
  const { game } = useLocalSearchParams();

  
  const gameData = game ? JSON.parse(game) : { name: 'Counter Strike 2', rating: '7.0' };

  
  const relatedGames = [
    { id: '1', title: 'Counter-Strike: Global Offensive (2012)', image: require('../assets/images/icon.png') },
    { id: '2', title: 'Counter-Strike 1.6 (1999)', image: require('../assets/images/icon.png') },
    { id: '3', title: 'Counter-Strike (2004)', image: require('../assets/images/icon.png') },
  ];

  const renderRelatedGame = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/GameDetailScreen', params: { game: JSON.stringify({ name: item.title }) } })}
      style={styles.relatedGameCard}
    >
      <Image source={item.image} style={styles.relatedGameImage} resizeMode="cover" />
      <Text style={styles.relatedGameText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../assets/images/Katman.png')}
      style={[styles.container, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.bannerContainer}>
          <Image
            source={require('../assets/images/ay.jpg')} 
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay} />
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
          </View>
        </View>

        
        <Text style={styles.gameTitle}>{gameData.name || 'Counter Strike 2'}</Text>
        <View style={styles.platformPriceRow}>
          <Text style={styles.platformText}>PS | PC</Text>
          <Text style={styles.priceText}>₺0</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" style={styles.starIcon} />
            <Text style={styles.ratingText}>{gameData.rating || '7.0'}</Text>
          </View>
        </View>

        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Release date</Text>
            <Text style={styles.infoValue}>September 27, 2023</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Genre</Text>
            <View style={styles.genreContainer}>
              <Text style={styles.genreText}>Action</Text>
              <Text style={styles.genreText}>Competitive</Text>
            </View>
          </View>
        </View>

        
        <Text style={styles.sectionTitle}>Details</Text>
        <Text style={styles.description}>
          Counter-Strike 2 (CS2) is the latest installment in the Counter-Strike series, released on 2023 as a free upgrade to CSGO. Built on the Source 2, Read more.
        </Text>

        
        <Text style={styles.sectionTitle}>Related Games</Text>
        <FlatList
          data={relatedGames}
          renderItem={renderRelatedGame}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.relatedGamesList}
        />
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
    paddingBottom: 100,
  },
  bannerContainer: {
    width: '100%',
    height: 250, 
    position: 'relative',
    marginBottom: 20,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  gameTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  platformPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginHorizontal: 20,
  },
  platformText: {
    color: '#A9A9A9',
    fontSize: 16,
    marginRight: 15,
  },
  priceText: {
    color: '#00FF00',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 5,
  },
  ratingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    color: '#A9A9A9',
    fontSize: 14,
    marginBottom: 5,
  },
  infoValue: {
    color: 'white',
    fontSize: 16,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreText: {
    color: 'white',
    fontSize: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 5,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginHorizontal: 20,
  },
  description: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  relatedGamesList: {
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  relatedGameCard: {
    width: 120,
    marginRight: 15,
  },
  relatedGameImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  relatedGameText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default GameDetailScreen;
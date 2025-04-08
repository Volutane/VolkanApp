import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const Home = () => {
  const router = useRouter();

  const popularGames = [
    { id: '1', title: 'Game 1', image: require('../../assets/images/icon.png') },
    { id: '2', title: 'CS2', image: require('../../assets/images/icon.png'), rating: '7.3' },
    { id: '3', title: 'Game 3', image: require('../../assets/images/icon.png') },
  ];

  const recommendedGames = [
    { id: '1', title: 'Game A' },
    { id: '2', title: 'Game B' },
    { id: '3', title: 'Game C' },
  ];

  const renderPopularGame = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/GameDetailScreen', params: { game: JSON.stringify(item) } })}
      style={styles.popularCard}
    >
      <Image source={item.image} style={styles.popularImage} resizeMode="cover" />
      {item.rating && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderRecommendedGame = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/GameDetailScreen', params: { game: JSON.stringify({ name: item.title }) } })}
      style={styles.recommendedCard}
    >
      <Text style={styles.recommendedText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../assets/images/Katman.png')}
      style={[styles.container, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          
          <View style={styles.header}>
            <Text style={styles.headerText}>Home</Text>
          </View>

          
          <Text style={styles.greetingText}>Hi [user name]</Text>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Games</Text>
            <TouchableOpacity>
              <Text style={styles.seeMoreText}>See More</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={popularGames}
            renderItem={renderPopularGame}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularList}
          />
          <TouchableOpacity
            style={styles.banner}
            onPress={() => router.push({ pathname: '/CategoryScreen', params: { category: 'Space/Universe' } })}
          >
            <Image
              source={require('../../assets/images/ay.jpg')}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerText}>Best Games About Space/Universe</Text>
              <TouchableOpacity style={styles.discoverButton}>
                <Text style={styles.discoverButtonText}>Discover</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Games you might like</Text>
            <TouchableOpacity>
              <Text style={styles.seeMoreText}>See More</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recommendedGames}
            renderItem={renderRecommendedGame}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.recommendedList}
          />
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
    justifyContent: 'flex-start', 
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  greetingText: {
    color: 'white',
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
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeMoreText: {
    color: '#00FF00',
    fontSize: 14,
  },
  popularList: {
    paddingBottom: 15,
  },
  popularCard: {
    width: 120,
    height: 120,
    marginRight: 15,
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
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  banner: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    marginTop: 20,
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
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  discoverButton: {
    backgroundColor: '#00FF00',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  discoverButtonText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recommendedList: {
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  recommendedCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: (width - 60) / 2,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home;
import { View, Text, ImageBackground, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';

const Community = () => {
  const router = useRouter();
  const { colors, backgroundImage } = useContext(ThemeContext);

  // Örnek tartışma verileri (API yerine statik)
  const [discussionThreads, setDiscussionThreads] = useState([
    {
      id: '1',
      gameId: 'cs2',
      gameName: 'Counter Strike 2',
      title: 'CS2’de en iyi taktikler neler?',
      category: 'Strateji',
      user: 'Player1',
      date: '2025-04-25',
      likes: 10,
      comments: [
        { id: 'c1', user: 'GamerX', text: 'Bence smoke atmayı öğrenmek çok önemli!', date: '2025-04-25', likes: 5 },
        { id: 'c2', user: 'ProPlayer', text: 'AWP ile uzun mesafeden oynamayı öneririm.', date: '2025-04-26', likes: 3 },
      ],
    },
    {
      id: '2',
      gameId: 'witcher3',
      gameName: 'The Witcher 3',
      title: 'Hangi ek paket daha iyi?',
      category: 'Genel',
      user: 'GamerX',
      date: '2025-04-24',
      likes: 8,
      comments: [
        { id: 'c3', user: 'ProPlayer', text: 'Blood and Wine kesinlikle harika!', date: '2025-04-24', likes: 4 },
      ],
    },
  ]);

  // Filtreleme ve arama durumu
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  // Kategoriler ve sıralama seçenekleri
  const categories = ['All', 'Genel', 'Strateji', 'Sorular', 'Hatalar'];
  const sortOptions = [
    { label: 'Popular', value: 'popular' },
    { label: 'Newest', value: 'newest' },
  ];

  // Tartışmaları filtreleme ve sıralama
  const filteredThreads = discussionThreads
    .filter((thread) =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.gameName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((thread) => categoryFilter === 'All' || thread.category === categoryFilter)
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return b.likes - a.likes; // Popülerlik (beğeni sayısına göre)
      } else {
        return new Date(b.date) - new Date(a.date); // En yeni
      }
    });

  const renderThread = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/DiscussionDetailScreen',
          params: { thread: JSON.stringify(item) },
        })
      }
      style={[styles.threadCard, { backgroundColor: colors.cardBackground }]}
    >
      <Text style={[styles.threadGame, { color: colors.secondaryText }]}>{item.gameName}</Text>
      <Text style={[styles.threadTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.threadMeta, { color: colors.secondaryText }]}>
        {item.category} | {item.user} | {item.date} | {item.comments.length} Comments | {item.likes} Likes
      </Text>
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerText, { color: colors.text }]}>Community</Text>
            <TouchableOpacity
              onPress={() => router.push('/NewDiscussionScreen')}
              style={[styles.newThreadButton, { backgroundColor: colors.buttonBackground }]}
            >
              <Ionicons name="add" size={24} color={colors.buttonText} />
            </TouchableOpacity>
          </View>

          {/* Arama Çubuğu */}
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.cardBackground, color: colors.text }]}
            placeholder="Search discussions..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Filtreleme Seçenekleri */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {/* Kategori Filtresi */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Category</Text>
              <View style={styles.filterOptions}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setCategoryFilter(category)}
                    style={[
                      styles.filterButton,
                      categoryFilter === category && { backgroundColor: colors.buttonBackground },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        categoryFilter === category ? { color: colors.buttonText } : { color: colors.text },
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sıralama */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Sort By</Text>
              <View style={styles.filterOptions}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSortBy(option.value)}
                    style={[
                      styles.filterButton,
                      sortBy === option.value && { backgroundColor: colors.buttonBackground },
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
          </ScrollView>

          {/* Tartışma Listesi */}
          <FlatList
            data={filteredThreads}
            renderItem={renderThread}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.threadList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.text }]}>No discussions found.</Text>
            }
          />
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
    paddingBottom: 0,
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
  newThreadButton: {
    borderRadius: 20,
    padding: 10,
  },
  searchInput: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  filterContainer: {
    marginBottom: 20,
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
  threadList: {
    paddingBottom: 60,
  },
  threadCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  threadGame: {
    fontSize: 12,
    marginBottom: 5,
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  threadMeta: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default Community;
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useContext } from 'react';
import { ThemeContext } from '../components/ThemeContext';

const GameCommunityScreen = ({ gameId, gameName }) => {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);

  // Örnek tartışma verileri (API yerine statik)
  const discussionThreads = [
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
      id: '3',
      gameId: 'cs2',
      gameName: 'Counter Strike 2',
      title: 'Yeni güncelleme hakkında ne düşünüyorsunuz?',
      category: 'Genel',
      user: 'ProPlayer',
      date: '2025-04-23',
      likes: 15,
      comments: [],
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
  ];

  // Oyuna özel tartışmalar (gameId ile filtreleme)
  const gameThreads = discussionThreads
    .filter((thread) => thread.gameId === gameId)
    .sort((a, b) => b.likes - a.likes) // Popülerlik sırasına göre
    .slice(0, 2); // İlk 2 tartışma

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
      <Text style={[styles.threadTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.threadMeta, { color: colors.secondaryText }]}>
        {item.category} | {item.user} | {item.date} | {item.comments.length} Comments | {item.likes} Likes
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Discussions</Text>
      {gameThreads.length > 0 ? (
        <FlatList
          data={gameThreads}
          renderItem={renderThread}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.threadList}
        />
      ) : (
        <Text style={[styles.emptyText, { color: colors.text }]}>No discussions yet.</Text>
      )}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/GameCommunityScreen',
            params: { gameId, gameName },
          })
        }
        style={[styles.loadMoreButton, { backgroundColor: colors.buttonBackground }]}
      >
        <Text style={[styles.loadMoreText, { color: colors.buttonText }]}>Load All Discussions</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginHorizontal: 20,
  },
  threadList: {
    paddingHorizontal: 20,
  },
  threadCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
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
    marginHorizontal: 20,
  },
  loadMoreButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default GameCommunityScreen;

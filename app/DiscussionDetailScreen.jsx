import { View, Text, ImageBackground, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useContext, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';

const DiscussionDetailScreen = () => {
  const router = useRouter();
  const { thread } = useLocalSearchParams();
  const { colors, backgroundImage } = useContext(ThemeContext);

  // Tartışma verilerini parse etme
  const threadData = thread ? JSON.parse(thread) : {};

  const [comments, setComments] = useState(threadData.comments || []);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim() === '') return;
    const newCommentObj = {
      id: (comments.length + 1).toString(),
      user: 'CurrentUser',
      text: newComment,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
    };
    setComments([...comments, newCommentObj]);
    setNewComment('');
  };

  const renderComment = ({ item }) => (
    <View style={[styles.commentCard, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.commentUser, { color: colors.text }]}>{item.user}</Text>
      <Text style={[styles.commentText, { color: colors.text }]}>{item.text}</Text>
      <Text style={[styles.commentMeta, { color: colors.secondaryText }]}>
        {item.date} | {item.likes} Likes
      </Text>
    </View>
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
            <Text style={[styles.headerText, { color: colors.text }]}>{threadData.gameName}</Text>
          </View>

          {/* Tartışma Detayı */}
          <View style={[styles.threadCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.threadGame, { color: colors.secondaryText }]}>{threadData.gameName}</Text>
            <Text style={[styles.threadTitle, { color: colors.text }]}>{threadData.title}</Text>
            <Text style={[styles.threadMeta, { color: colors.secondaryText }]}>
              {threadData.category} | {threadData.user} | {threadData.date} | {threadData.likes} Likes
            </Text>
          </View>

          {/* Yorum Ekleme */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={[styles.commentInput, { backgroundColor: colors.cardBackground, color: colors.text }]}
              placeholder="Add a comment..."
              placeholderTextColor={colors.secondaryText}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={[styles.commentButton, { backgroundColor: colors.buttonBackground }]}
              onPress={handleAddComment}
            >
              <Text style={[styles.commentButtonText, { color: colors.buttonText }]}>Post</Text>
            </TouchableOpacity>
          </View>

          {/* Yorum Listesi */}
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.commentList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.text }]}>No comments yet. Be the first to comment!</Text>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  threadCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
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
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  commentInput: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    height: 50,
    marginRight: 10,
  },
  commentButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  commentButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentList: {
    paddingBottom: 60,
  },
  commentCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  commentMeta: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default DiscussionDetailScreen;
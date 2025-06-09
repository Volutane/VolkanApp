import { View, Text, ImageBackground, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useContext, useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';
import { auth, db } from '../lib/firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, increment, deleteDoc, getDoc, setDoc, getDocs } from 'firebase/firestore';

const GameCommentsScreen = () => {
  const router = useRouter();
  const { game } = useLocalSearchParams();
  const { colors, backgroundImage } = useContext(ThemeContext);

  const gameData = game ? JSON.parse(game) : { name: 'Counter Strike 2', id: 'default' };
  const gameId = gameData.id;

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [sortByDate, setSortByDate] = useState('newest');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  const platforms = ['all', 'PC', 'PS', 'Xbox', 'Switch', 'Mac', 'Linux', 'Android', 'iOS'];
  const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Oldest', value: 'oldest' },
  ];

  useEffect(() => {
    if (!gameId) return;

    let q = query(collection(db, 'games', gameId.toString(), 'comments'));
    if (sortByDate === 'newest') {
      q = query(q, orderBy('date', 'desc'));
    } else {
      q = query(q, orderBy('date', 'asc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), gameId: gameId.toString() }));
      setComments(commentsList);
    }, (error) => {
      console.error('Error fetching comments:', error);
      setComments([]);
    });

    return () => unsubscribe();
  }, [gameId, sortByDate]);

  const filteredComments = comments.filter(
    (comment) => platformFilter === 'all' || comment.platform.toLowerCase() === platformFilter.toLowerCase()
  );

  const handleAddComment = async () => {
    if (newComment.trim() === '') return;

    if (!auth.currentUser) {
      router.push('/SignInScreen');
      return;
    }

    try {
      const user = auth.currentUser;
      const newCommentObj = {
        userId: user.uid,
        username: user.displayName || 'Anonymous User',
        text: newComment,
        platform: 'PC',
        date: new Date().toISOString().split('T')[0],
        likes: 0,
      };
      await addDoc(collection(db, 'games', gameId.toString(), 'comments'), newCommentObj);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleLike = async (commentId) => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const commentRef = doc(db, 'games', gameId.toString(), 'comments', commentId);
    const likeRef = doc(db, 'games', gameId.toString(), 'comments', commentId, 'likes', userId);

    try {
      const likeDoc = await getDoc(likeRef);
      if (likeDoc.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(commentRef, { likes: increment(-1) });
      } else {
        await setDoc(likeRef, {});
        await updateDoc(commentRef, { likes: increment(1) });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleEditComment = async (commentId, newText) => {
    if (!auth.currentUser) return;

    try {
      const commentRef = doc(db, 'games', gameId.toString(), 'comments', commentId);
      await updateDoc(commentRef, { text: newText });
      setEditingCommentId(null);
      setEditCommentText('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!auth.currentUser) return;

    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const commentRef = doc(db, 'games', gameId.toString(), 'comments', commentId);
              await deleteDoc(commentRef);
            } catch (error) {
              console.error('Error deleting comment:', error);
            }
          }
        }
      ]
    );
  };

  const CommentItem = ({ item }) => {
    const [newReply, setNewReply] = useState('');
    const [replies, setReplies] = useState([]);
    const isLikedByUser = auth.currentUser && item.likes && item.likes[auth.currentUser.uid];
    const isCommentOwner = auth.currentUser && item.userId === auth.currentUser.uid;

    useEffect(() => {
      const repliesQuery = query(collection(db, 'games', gameId.toString(), 'comments', item.id, 'replies'), orderBy('date', 'asc'));
      const unsubscribe = onSnapshot(repliesQuery, (snapshot) => {
        const repliesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReplies(repliesList);
      }, (error) => console.error('Error fetching replies:', error));

      return () => unsubscribe();
    }, [item.id]);

    const handleAddReply = async () => {
      if (!newReply.trim() || !auth.currentUser) return;

      try {
        const user = auth.currentUser;
        const replyData = {
          userId: user.uid,
          username: user.displayName || 'Anonymous',
          text: newReply,
          date: new Date().toISOString().split('T')[0],
        };
        await addDoc(collection(db, 'games', gameId.toString(), 'comments', item.id, 'replies'), replyData);
        setNewReply('');
      } catch (error) {
        console.error('Error adding reply:', error);
      }
    };

    const renderReply = ({ item: reply }) => (
      <View style={[styles.replyCard, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.replyHeader}>
          <Text style={[styles.replyUser, { color: colors.text }]}>{reply.username}</Text>
          {auth.currentUser && reply.userId === auth.currentUser.uid && (
            <View style={styles.replyActions}>
              <TouchableOpacity onPress={() => handleDeleteReply(item.id, reply.id)}>
                <Ionicons name="trash-outline" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={[styles.replyText, { color: colors.text }]}>{reply.text}</Text>
        <Text style={[styles.replyMeta, { color: colors.secondaryText }]}>{reply.date}</Text>
      </View>
    );

    const handleDeleteReply = async (commentId, replyId) => {
      Alert.alert(
        'Delete Reply',
        'Are you sure you want to delete this reply?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const replyRef = doc(db, 'games', gameId.toString(), 'comments', commentId, 'replies', replyId);
                await deleteDoc(replyRef);
              } catch (error) {
                console.error('Error deleting reply:', error);
              }
            }
          }
        ]
      );
    };

    return (
      <View style={[styles.commentCard, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.commentHeader}>
          <Text style={[styles.commentUser, { color: colors.text }]}>{item.username}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.likeButton}>
              <Ionicons name={isLikedByUser ? "heart" : "heart-outline"} size={18} color={isLikedByUser ? "#FF0000" : colors.text} />
              <Text style={[styles.likeCount, { color: colors.text }]}>{item.likes || 0}</Text>
            </TouchableOpacity>
            {isCommentOwner && (
              <View style={styles.ownerActions}>
                <TouchableOpacity onPress={() => {
                  setEditingCommentId(item.id);
                  setEditCommentText(item.text);
                }}>
                  <Ionicons name="pencil-outline" size={18} color={colors.text} style={styles.actionIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                  <Ionicons name="trash-outline" size={18} color={colors.text} style={styles.actionIcon} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        {editingCommentId === item.id ? (
          <View style={styles.editContainer}>
            <TextInput
              style={[styles.editInput, { backgroundColor: colors.cardBackground, color: colors.text }]}
              value={editCommentText}
              onChangeText={setEditCommentText}
              multiline
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.buttonBackground }]}
                onPress={() => handleEditComment(item.id, editCommentText)}
              >
                <Text style={[styles.editButtonText, { color: colors.buttonText }]}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.cardBackground }]}
                onPress={() => {
                  setEditingCommentId(null);
                  setEditCommentText('');
                }}
              >
                <Text style={[styles.editButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={[styles.commentText, { color: colors.text }]}>{item.text}</Text>
        )}
        <Text style={[styles.commentMeta, { color: colors.secondaryText }]}>{item.platform} | {item.date}</Text>
        {replies.length > 0 && (
          <FlatList
            data={replies}
            renderItem={renderReply}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.repliesList}
          />
        )}
        <View style={styles.replyInputContainer}>
          <TextInput
            style={[styles.replyInput, { backgroundColor: colors.cardBackground, color: colors.text }]}
            placeholder="Write a reply..."
            placeholderTextColor={colors.secondaryText}
            value={newReply}
            onChangeText={setNewReply}
            multiline
          />
          <TouchableOpacity
            style={[styles.replyButton, { backgroundColor: colors.buttonBackground }]}
            onPress={handleAddReply}
            disabled={!newReply.trim()}
          >
            <Text style={[styles.replyButtonText, { color: colors.buttonText }]}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderComment = ({ item }) => <CommentItem item={item} />;

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
            <Text style={[styles.headerText, { color: colors.text }]}>{gameData.name} - Comments</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Platform</Text>
              <View style={styles.filterOptions}>
                {platforms.map((platform) => (
                  <TouchableOpacity
                    key={platform}
                    onPress={() => setPlatformFilter(platform)}
                    style={[
                      styles.filterButton,
                      platformFilter === platform && { backgroundColor: colors.buttonBackground },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        platformFilter === platform ? { color: colors.buttonText } : { color: colors.text },
                      ]}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Sort By Date</Text>
              <View style={styles.filterOptions}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSortByDate(option.value)}
                    style={[
                      styles.filterButton,
                      sortByDate === option.value && { backgroundColor: colors.buttonBackground },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        sortByDate === option.value ? { color: colors.buttonText } : { color: colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

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

          <FlatList
            data={filteredComments}
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
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  commentMeta: {
    fontSize: 12,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 5,
    fontSize: 14,
  },
  repliesList: {
    paddingLeft: 15,
    marginTop: 10,
  },
  replyCard: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
  },
  replyUser: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  replyText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 3,
  },
  replyMeta: {
    fontSize: 11,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  replyInput: {
    flex: 1,
    borderRadius: 10,
    padding: 8,
    height: 40,
    marginRight: 10,
  },
  replyButton: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  replyButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionIcon: {
    marginLeft: 10,
  },
  editContainer: {
    marginVertical: 10,
  },
  editInput: {
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    marginBottom: 10,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  replyActions: {
    flexDirection: 'row',
  },
});

export default GameCommentsScreen;
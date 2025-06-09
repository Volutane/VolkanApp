import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../components/ThemeContext';
import { auth, db } from '../lib/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';

const NotificationsScreen = () => {
  const router = useRouter();
  const { colors, backgroundImage } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        fetchNotifications(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchNotifications = async (userId) => {
    try {
      setLoading(true);
      const notificationsRef = collection(db, 'users', userId, 'notifications');
      const q = query(notificationsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const notificationsList = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const notification = doc.data();
          const userDoc = await getDoc(doc(db, 'users', notification.userId));
          const gameDoc = await getDoc(doc(db, 'games', notification.gameId));
          
          return {
            id: doc.id,
            ...notification,
            user: userDoc.data(),
            game: gameDoc.data()
          };
        })
      );
      
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNotification = ({ item }) => {
    const getNotificationText = () => {
      switch (item.type) {
        case 'added_to_played':
          return `${item.user.username} added ${item.game.name} to their played games`;
        case 'added_to_wishlist':
          return `${item.user.username} added ${item.game.name} to their wishlist`;
        default:
          return 'Unknown activity';
      }
    };

    return (
      <TouchableOpacity
        style={[styles.notificationCard, { backgroundColor: colors.cardBackground }]}
        onPress={() => router.push({
          pathname: '/GameDetailScreen',
          params: { game: JSON.stringify({ id: item.gameId, name: item.game.name }) }
        })}
      >
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationText, { color: colors.text }]}>
            {getNotificationText()}
          </Text>
          <Text style={[styles.timestamp, { color: colors.secondaryText }]}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.container} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: colors.text }]}>Notifications</Text>
          <View style={styles.backButton} />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.notificationList}
            ListEmptyComponent={() => (
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No notifications yet
              </Text>
            )}
          />
        )}
      </View>
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
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationList: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default NotificationsScreen; 
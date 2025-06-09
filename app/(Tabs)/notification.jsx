import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Dimensions, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../../components/ThemeContext';
import { auth, db } from '../../lib/firebaseConfig';
import { collection, query, orderBy, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

const Notification = () => {
  const router = useRouter();
  const { colors, backgroundImage } = useContext(ThemeContext);
  const [selectedTab, setSelectedTab] = useState('Friends');
  const [friendsNotifications, setFriendsNotifications] = useState([]);
  const [yourNotifications, setYourNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState([]);

  const tabs = ['Friends', 'You'];

  useEffect(() => {
    const fetchFollowingAndNotifications = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log('No authenticated user at', new Date().toLocaleTimeString());
          setLoading(false);
          return;
        }

        // Fetch following users
        const followingRef = collection(db, 'users', user.uid, 'following');
        const followingSnapshot = await getDocs(followingRef);
        const followingList = [];
        for (const docSnap of followingSnapshot.docs) {
          const followedUserId = docSnap.id;
          const userDoc = await getDoc(doc(db, 'users', followedUserId));
          if (userDoc.exists()) {
            followingList.push({ id: followedUserId, username: userDoc.data().username || 'Unknown User' });
          }
        }
        setFollowing(followingList);
        console.log('Following users with usernames:', followingList);

        const unsubscribeList = [];

        // Fetch your notifications
        const playedQuery = query(collection(db, 'users', user.uid, 'played'), orderBy('addedAt', 'desc'));
        const wishlistQuery = query(collection(db, 'users', user.uid, 'wishlist'), orderBy('addedAt', 'desc'));

        const unsubscribeYourPlayed = onSnapshot(playedQuery, (snapshot) => {
          const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            user: 'You',
            status: 'Played',
            gameId: doc.id,
            gameName: doc.data().name,
            gameImage: doc.data().cover ? { uri: doc.data().cover } : require('../../assets/images/icon.png'),
          }));
          setYourNotifications(prev => [...prev, ...notifications].filter((item, index, self) => index === self.findIndex((t) => t.id === item.id)));
        }, (error) => console.error('Error fetching your played notifications at', new Date().toLocaleTimeString(), ':', error));

        const unsubscribeYourWishlist = onSnapshot(wishlistQuery, (snapshot) => {
          const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            user: 'You',
            status: 'Wants',
            gameId: doc.id,
            gameName: doc.data().name,
            gameImage: doc.data().cover ? { uri: doc.data().cover } : require('../../assets/images/icon.png'),
          }));
          setYourNotifications(prev => [...prev, ...notifications].filter((item, index, self) => index === self.findIndex((t) => t.id === item.id)));
        }, (error) => console.error('Error fetching your wishlist notifications at', new Date().toLocaleTimeString(), ':', error));

        unsubscribeList.push(unsubscribeYourPlayed, unsubscribeYourWishlist);

        // Fetch friends' notifications
        followingList.forEach(followedUser => {
          const followedUserId = followedUser.id;
          const username = followedUser.username;

          const playedQueryFriend = query(collection(db, 'users', followedUserId, 'played'), orderBy('addedAt', 'desc'));
          const wishlistQueryFriend = query(collection(db, 'users', followedUserId, 'wishlist'), orderBy('addedAt', 'desc'));

          const unsubscribePlayed = onSnapshot(playedQueryFriend, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
              id: `${followedUserId}_${doc.id}_played`,
              user: username,
              status: 'Played',
              gameId: doc.id,
              gameName: doc.data().name,
              gameImage: doc.data().cover ? { uri: doc.data().cover } : require('../../assets/images/icon.png'),
            }));
            setFriendsNotifications(prev => [...prev, ...notifications].filter((item, index, self) => index === self.findIndex((t) => t.id === item.id)));
          }, (error) => console.error(`Error fetching played notifications for ${followedUserId} at`, new Date().toLocaleTimeString(), ':', error));

          const unsubscribeWishlist = onSnapshot(wishlistQueryFriend, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
              id: `${followedUserId}_${doc.id}_wishlist`,
              user: username,
              status: 'Wants',
              gameId: doc.id,
              gameName: doc.data().name,
              gameImage: doc.data().cover ? { uri: doc.data().cover } : require('../../assets/images/icon.png'),
            }));
            setFriendsNotifications(prev => [...prev, ...notifications].filter((item, index, self) => index === self.findIndex((t) => t.id === item.id)));
          }, (error) => console.error(`Error fetching wishlist notifications for ${followedUserId} at`, new Date().toLocaleTimeString(), ':', error));

          unsubscribeList.push(unsubscribePlayed, unsubscribeWishlist);
        });

        setLoading(false);

        return () => unsubscribeList.forEach(unsubscribe => unsubscribe());
      } catch (error) {
        console.error('Error in fetchFollowingAndNotifications at', new Date().toLocaleTimeString(), ':', error);
        setLoading(false);
      }
    };

    fetchFollowingAndNotifications();
  }, []);

  const renderNotification = ({ item }) => (
    <View style={[styles.notificationCard, { backgroundColor: colors.cardBackground }]}>
      <View style={[styles.avatar, { backgroundColor: colors.buttonBackground }]} />
      <View style={styles.notificationContent}>
        <View style={styles.textContainer}>
          <Text style={[styles.userText, { color: colors.text }]}>{item.user}</Text>
          <Text style={[styles.statusText, { color: colors.secondaryText }]}> {item.status}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            try {
              console.log('Navigating to game:', {
                id: item.gameId,
                name: item.gameName
              });
              router.push({
                pathname: '/GameDetailScreen',
                params: { 
                  game: JSON.stringify({ 
                    id: item.gameId,
                    name: item.gameName
                  })
                }
              });
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }}
        >
          <Image 
            source={item.gameImage} 
            style={styles.gameImage} 
            resizeMode="cover" 
            onError={(e) => console.error('Image loading error:', e.nativeEvent.error, 'for user:', item.user)}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={[styles.container, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: colors.text }]}>Notifications</Text>
        </View>

        <View style={[styles.tabMenu, { backgroundColor: colors.buttonBackground }]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={styles.tabItem}
            >
              <Text style={[styles.tabText, { color: colors.text }]}>{tab}</Text>
              {selectedTab === tab && <View style={[styles.activeIndicator, { backgroundColor: '#00FF00' }]} />}
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={selectedTab === 'Friends' ? friendsNotifications : yourNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.notificationList}
          ListEmptyComponent={() => (
            <Text style={[styles.emptyText, { color: colors.text }]}>No notifications yet.</Text>
          )}
        />
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
  },
  tabMenu: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    bottom: 2,
  },
  notificationList: {
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 14,
  },
  gameImage: {
    width: 60,
    height: 80,
    borderRadius: 5,
  },
  loadingContainer: {
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

export default Notification;
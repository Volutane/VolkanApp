import { View, Text, ImageBackground, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../../components/ThemeContext';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebaseConfig';
import { collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

const Profile = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, backgroundImage } = useContext(ThemeContext);
  const [selectedTab, setSelectedTab] = useState('Games');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isCurrentUser, setIsCurrentUser] = useState(true);

  const tabs = ['Games', 'Wishlist'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      console.log('Auth state changed at', new Date().toLocaleTimeString(), 'User:', authUser?.uid);
      if (authUser) {
        if (params.userId && params.userId !== authUser.uid) {
          await loadUserProfile(params.userId);
        } else {
          setUser(authUser);
          setIsCurrentUser(true);
          const cleanup = await fetchUserGames(authUser.uid);
          await fetchFollowData(authUser.uid);
          
          return () => {
            if (cleanup) cleanup();
          };
        }
      } else {
        console.log('No authenticated user at', new Date().toLocaleTimeString());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [params.userId]);

  const loadUserProfile = async (userId) => {
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          uid: userId,
          email: userData.email,
          displayName: userData.username
        });
        setIsCurrentUser(false);
        await fetchUserGames(userId);
        await fetchFollowData(userId);
      } else {
        console.error('User document not found for ID:', userId);
      }
    } catch (error) {
      console.error('Error loading user profile at', new Date().toLocaleTimeString(), ':', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGames = async (userId) => {
    try {
      setLoading(true);
      console.log('Setting up realtime listeners for user:', userId, 'at', new Date().toLocaleTimeString());

      const playedQuery = query(collection(db, 'users', userId, 'played'), orderBy('addedAt', 'desc'));
      const playedUnsubscribe = onSnapshot(playedQuery, (snapshot) => {
        const playedGames = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Played game data from Firestore:', data); // Firestore'dan gelen veriyi loglayalım
          if (!data.cover) {
            console.warn('Cover is missing for played game:', data.name || data.id);
          }
          return {
            id: doc.id,
            gameId: data.id || doc.id,
            name: data.name || 'Unknown Game',
            cover: data.cover || null,
            addedAt: data.addedAt || new Date().toISOString(),
          };
        });
        console.log('Realtime update - Played games:', playedGames);
        setGames(playedGames);
      }, (error) => {
        console.error('Error in played games listener at', new Date().toLocaleTimeString(), ':', error);
        if (error.code === 'failed-precondition') {
          setIsOffline(true);
        }
      });

      const wishlistQuery = query(collection(db, 'users', userId, 'wishlist'), orderBy('addedAt', 'desc'));
      const wishlistUnsubscribe = onSnapshot(wishlistQuery, (snapshot) => {
        const wishlistGames = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Wishlist game data from Firestore:', data); // Firestore'dan gelen veriyi loglayalım
          if (!data.cover) {
            console.warn('Cover is missing for wishlist game:', data.name || data.id);
          }
          return {
            id: doc.id,
            gameId: data.id || doc.id,
            name: data.name || 'Unknown Game',
            cover: data.cover || null,
            addedAt: data.addedAt || new Date().toISOString(),
          };
        });
        console.log('Realtime update - Wishlist games:', wishlistGames);
        setWishlist(wishlistGames);
      }, (error) => {
        console.error('Error in wishlist games listener at', new Date().toLocaleTimeString(), ':', error);
        if (error.code === 'failed-precondition') {
          setIsOffline(true);
        }
      });

      setIsOffline(false);

      return () => {
        playedUnsubscribe();
        wishlistUnsubscribe();
      };
    } catch (error) {
      console.error('Error setting up game listeners at', new Date().toLocaleTimeString(), ':', error);
      if (error.code === 'failed-precondition') {
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowData = async (userId) => {
    try {
      if (!userId) {
        console.log('No user ID provided for fetchFollowData at', new Date().toLocaleTimeString());
        return;
      }
      
      const followersRef = collection(db, 'users', userId, 'followers');
      const followersSnapshot = await getDocs(followersRef);
      const followersList = followersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFollowers(followersList);

      const followingRef = collection(db, 'users', userId, 'following');
      const followingSnapshot = await getDocs(followingRef);
      const followingList = followingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFollowing(followingList);
    } catch (error) {
      console.error('Error fetching follow data at', new Date().toLocaleTimeString(), ':', error);
    }
  };

  const handleRefresh = async () => {
    if (user) {
      await fetchUserGames(user.uid);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Giriş yapılmamış. Lütfen giriş yapın.</Text>
        <TouchableOpacity onPress={() => router.replace('/SignInScreen')}>
          <Text style={{ color: colors.link, marginTop: 10 }}>Giriş Ekranına Git</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const coverUrl = item.cover ? item.cover.replace('t_cover_big', 't_1080p') : null;
    console.log('Rendering game in Profile:', item.name, 'with cover URL:', coverUrl);
    
    return (
      <TouchableOpacity
        onPress={() => {
          console.log('Navigating to GameDetailScreen from Profile with:', item, 'at', new Date().toLocaleTimeString());
          try {
            router.push({
              pathname: '/GameDetailScreen',
              params: { game: JSON.stringify({ id: item.gameId, name: item.name }) }
            });
          } catch (err) {
            console.error('Navigation error in Profile at', new Date().toLocaleTimeString(), ':', err);
          }
        }}
        style={styles.gameCard}
      >
        <View style={styles.gameCardContent}>
          <Image
            source={coverUrl ? { uri: coverUrl } : require('../../assets/images/icon.png')}
            style={styles.gameImage}
            resizeMode="cover"
            onError={(e) => console.error('Image loading error in Profile:', e.nativeEvent.error, 'for game:', item.name, 'URL:', coverUrl)}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderGameList = (games, type) => {
    const displayedGames = games.slice(0, 4);
    const hasMore = games.length > 4;

    return (
      <View style={styles.gameListContainer}>
        <FlatList
          data={displayedGames}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gameList}
          ListEmptyComponent={() => (
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {type === 'Games' ? 'No played games yet' : 'No games in wishlist'}
            </Text>
          )}
        />
        {hasMore && (
          <TouchableOpacity
            style={[styles.seeMoreButton, { backgroundColor: colors.buttonBackground }]}
            onPress={() => {
              if (!games || !Array.isArray(games)) {
                console.error('Games data is invalid or empty at', new Date().toLocaleTimeString(), ':', games);
                return;
              }

              const formattedGames = games.map(game => ({
                id: game.id || game.gameId,
                name: game.name || 'Unknown Game',
                cover: game.cover || null,
              }));

              try {
                const gamesString = JSON.stringify(formattedGames);
                console.log('Navigating to GameListScreen with games data at', new Date().toLocaleTimeString(), ':', gamesString);
                router.push({
                  pathname: '/GameListScreen',
                  params: { 
                    type: type,
                    games: gamesString
                  }
                });
              } catch (e) {
                console.error('Error stringifying games data at', new Date().toLocaleTimeString(), ':', e);
              }
            }}
          >
            <Text style={[styles.seeMoreText, { color: colors.buttonText }]}>
              See More ({games.length} games)
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFollowStats = () => (
    <View style={styles.statsContainer}>
      <TouchableOpacity 
        style={styles.statItem} 
        onPress={() => {
          console.log('Navigating to GameListScreen with Played games at', new Date().toLocaleTimeString());
          if (!games || !Array.isArray(games)) {
            console.error('Played games data is invalid or empty at', new Date().toLocaleTimeString(), ':', games);
            return;
          }
          const formattedGames = games.map(game => ({
            id: game.id || game.gameId,
            name: game.name || 'Unknown Game',
            cover: game.cover || null,
          }));
          try {
            const gamesString = JSON.stringify(formattedGames);
            router.push({
              pathname: '/GameListScreen',
              params: { 
                type: 'Games',
                games: gamesString
              }
            });
          } catch (e) {
            console.error('Error stringifying Played games at', new Date().toLocaleTimeString(), ':', e);
          }
        }}
      >
        <Text style={[styles.statNumber, { color: colors.text }]}>{games.length}</Text>
        <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Played</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.statItem} 
        onPress={() => {
          console.log('Navigating to GameListScreen with Wishlist games at', new Date().toLocaleTimeString());
          if (!wishlist || !Array.isArray(wishlist)) {
            console.error('Wishlist games data is invalid or empty at', new Date().toLocaleTimeString(), ':', wishlist);
            return;
          }
          const formattedGames = wishlist.map(game => ({
            id: game.id || game.gameId,
            name: game.name || 'Unknown Game',
            cover: game.cover || null,
          }));
          try {
            const gamesString = JSON.stringify(formattedGames);
            router.push({
              pathname: '/GameListScreen',
              params: { 
                type: 'Wishlist',
                games: gamesString
              }
            });
          } catch (e) {
            console.error('Error stringifying Wishlist games at', new Date().toLocaleTimeString(), ':', e);
          }
        }}
      >
        <Text style={[styles.statNumber, { color: colors.text }]}>{wishlist.length}</Text>
        <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Wishlist</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.statItem} 
        onPress={() => {
          try {
            router.push({
              pathname: '/FollowListScreen',
              params: { type: 'followers', userId: user.uid }
            });
          } catch (e) {
            console.error('Navigation error for Followers at', new Date().toLocaleTimeString(), ':', e);
          }
        }}
      >
        <Text style={[styles.statNumber, { color: colors.text }]}>{followers.length}</Text>
        <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Followers</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.statItem} 
        onPress={() => {
          try {
            router.push({
              pathname: '/FollowListScreen',
              params: { type: 'following', userId: user.uid }
            });
          } catch (e) {
            console.error('Navigation error for Following at', new Date().toLocaleTimeString(), ':', e);
          }
        }}
      >
        <Text style={[styles.statNumber, { color: colors.text }]}>{following.length}</Text>
        <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Following</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground source={backgroundImage} style={[styles.container, { width, height }]} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: colors.text }]}>Profile</Text>
          {isCurrentUser && (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() => {
                  try {
                    router.push('/NotificationsScreen');
                  } catch (e) {
                    console.error('Navigation error for Notifications at', new Date().toLocaleTimeString(), ':', e);
                  }
                }}
                style={styles.headerButton}
              >
                <Ionicons name="notifications" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  try {
                    router.push('/SearchUsersScreen');
                  } catch (e) {
                    console.error('Navigation error for Search at', new Date().toLocaleTimeString(), ':', e);
                  }
                }}
                style={styles.headerButton}
              >
                <Ionicons name="search" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  try {
                    router.push('/Settings');
                  } catch (e) {
                    console.error('Navigation error for Settings at', new Date().toLocaleTimeString(), ':', e);
                  }
                }}
              >
                <Ionicons name="settings" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Image source={require('../../assets/images/ay.jpg')} style={styles.coverImage} resizeMode="cover" />

        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.cardBackground, borderColor: colors.text }]} />
          </View>
          <Text style={[styles.username, { color: colors.text }]}>
            {user.displayName || 'Kullanıcı Adı'}
          </Text>
          <Text style={[styles.email, { color: colors.secondaryText }]}>{user.email}</Text>

          {renderFollowStats()}

          {isCurrentUser && (
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.buttonBackground }]}
              onPress={() => router.push('/EditProfileScreen')}
            >
              <Text style={[styles.editButtonText, { color: colors.buttonText }]}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {isOffline && (
          <View style={[styles.offlineBanner, { backgroundColor: colors.error }]}>
            <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
            <Text style={styles.offlineText}>You're offline. Changes will sync when you're back online.</Text>
          </View>
        )}

        <View style={styles.tabMenu}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[
                styles.tabItem,
                selectedTab === tab && { borderBottomColor: colors.text, borderBottomWidth: 2 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab
                    ? [styles.tabTextActive, { color: colors.text }]
                    : { color: colors.secondaryText },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedTab === 'Games' ? renderGameList(games, 'Games') : renderGameList(wishlist, 'Wishlist')}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'black', opacity: 0.3 },
  content: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10 },
  headerText: { fontSize: 24, fontWeight: 'bold' },
  coverImage: { width: '100%', height: 150 },
  profileInfo: { alignItems: 'center', padding: 20 },
  avatarContainer: { marginTop: -50 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3 },
  username: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  email: { fontSize: 16, marginTop: 5 },
  followStats: { flexDirection: 'row', marginTop: 10 },
  followItem: { alignItems: 'center', marginHorizontal: 20, padding: 10, borderRadius: 8 },
  followCount: { fontSize: 18, fontWeight: 'bold' },
  followLabel: { fontSize: 14 },
  editButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, marginTop: 15 },
  editButtonText: { fontSize: 16, fontWeight: 'bold' },
  tabMenu: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  tabItem: { paddingVertical: 5, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 16 },
  tabTextActive: { fontWeight: 'bold' },
  gameList: { paddingHorizontal: 10, paddingBottom: 100, paddingTop: 10 },
  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: 5 },
  gameCard: { width: (width - 40) / 2, aspectRatio: 2/3, marginBottom: 15, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(0, 0, 0, 0.2)' },
  gameCardContent: { width: '100%', height: '100%' },
  gameImage: { width: '100%', height: '100%', borderRadius: 12, backgroundColor: 'rgba(0, 0, 0, 0.1)' },
  gameInfo: { padding: 8, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  gameTitle: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  offlineBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, marginHorizontal: 20, borderRadius: 8, marginBottom: 20 },
  offlineText: { color: '#FFFFFF', marginLeft: 8, fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
  gameListContainer: { flex: 1 },
  seeMoreButton: { marginHorizontal: 20, marginBottom: 20, padding: 12, borderRadius: 8, alignItems: 'center' },
  seeMoreText: { fontSize: 16, fontWeight: 'bold' },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  statItem: { alignItems: 'center', padding: 10, borderRadius: 8 },
  statNumber: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 14 },
});

export default Profile;
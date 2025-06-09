import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../components/ThemeContext';
import { auth, db } from '../lib/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const SearchUsersScreen = () => {
  const router = useRouter();
  const { colors, backgroundImage } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [followingStatus, setFollowingStatus] = useState({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (currentUser && users.length > 0) {
        const status = {};
        for (const user of users) {
          const followingRef = doc(db, 'users', currentUser.uid, 'following', user.id);
          const followingDoc = await getDoc(followingRef);
          status[user.id] = followingDoc.exists();
        }
        setFollowingStatus(status);
      }
    };
    checkFollowStatus();
  }, [currentUser, users]);

  const searchUsers = async (searchText) => {
    if (!searchText.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const usersList = usersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user => 
          user.username && 
          user.username.toLowerCase().includes(searchText.toLowerCase())
        );
      
      console.log('Found users:', usersList);
      setUsers(usersList);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId) => {
    if (!currentUser) {
      router.push('/SignInScreen');
      return;
    }

    try {
      const currentUserId = currentUser.uid;
      const isFollowing = followingStatus[targetUserId];
      console.log('Current user ID:', currentUserId);
      console.log('Target user ID:', targetUserId);
      console.log('Is following:', isFollowing);

      if (isFollowing) {
        // Unfollow
        console.log('Unfollowing user...');
        const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
        const followersRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
        
        await deleteDoc(followingRef);
        console.log('Deleted from following collection');
        
        await deleteDoc(followersRef);
        console.log('Deleted from followers collection');
      } else {
        // Follow
        console.log('Following user...');
        const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
        const followersRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
        
        // Get current user data
        const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
        let currentUserName = 'Unknown User';
        if (currentUserDoc.exists()) {
          const currentUserData = currentUserDoc.data();
          console.log('Current user data:', currentUserData);
          currentUserName = currentUserData.username || currentUserData.displayName || currentUser.displayName || 'Unknown User';
        } else {
          console.warn('Current user document not found, creating one...');
          // Eğer kullanıcı belgesi yoksa, oluştur
          await setDoc(doc(db, 'users', currentUserId), {
            username: currentUser.displayName || 'User_' + currentUserId.slice(0, 8),
            email: currentUser.email || 'unknown@example.com',
            createdAt: new Date().toISOString(),
          });
          currentUserName = currentUser.displayName || 'User_' + currentUserId.slice(0, 8);
        }
        
        // Get target user data
        const targetUserDoc = await getDoc(doc(db, 'users', targetUserId));
        let targetUserName = 'Unknown User';
        if (targetUserDoc.exists()) {
          const targetUserData = targetUserDoc.data();
          console.log('Target user data:', targetUserData);
          targetUserName = targetUserData.username || targetUserData.displayName || 'Unknown User';
        } else {
          console.warn('Target user document not found, creating one...');
          // Eğer hedef kullanıcı belgesi yoksa, oluştur
          await setDoc(doc(db, 'users', targetUserId), {
            username: 'User_' + targetUserId.slice(0, 8),
            email: 'unknown@example.com',
            createdAt: new Date().toISOString(),
          });
          targetUserName = 'User_' + targetUserId.slice(0, 8);
        }
        
        // Save to following collection with user data
        const followingData = {
          timestamp: new Date().toISOString(),
          username: targetUserName
        };
        console.log('Saving following data:', followingData);
        await setDoc(followingRef, followingData);
        
        // Save to followers collection with user data
        const followersData = {
          timestamp: new Date().toISOString(),
          username: currentUserName
        };
        console.log('Saving followers data:', followersData);
        await setDoc(followersRef, followersData);
      }

      // Update following status
      setFollowingStatus(prev => ({
        ...prev,
        [targetUserId]: !isFollowing
      }));

      // Refresh the list
      await searchUsers(searchQuery);
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const renderUser = ({ item }) => {
    const isFollowing = followingStatus[item.id] || false;
    
    return (
      <View style={[styles.userCard, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.userInfo}>
          <Text style={[styles.username, { color: colors.text }]}>{item.username || 'Unknown User'}</Text>
          <Text style={[styles.email, { color: colors.secondaryText }]}>{item.email || 'No email'}</Text>
        </View>
        {currentUser && currentUser.uid !== item.id && (
          <TouchableOpacity
            style={[
              styles.followButton,
              { backgroundColor: isFollowing ? colors.error : colors.accent }
            ]}
            onPress={() => handleFollow(item.id)}
          >
            <Text style={[styles.followButtonText, { color: colors.buttonText }]}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
          <Text style={[styles.headerText, { color: colors.text }]}>Search Users</Text>
          <View style={styles.backButton} />
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
          <Ionicons name="search" size={20} color={colors.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by username..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              searchUsers(text.toLowerCase());
            }}
          />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.userList}
            ListEmptyComponent={() => (
              <Text style={[styles.emptyText, { color: colors.text }]}>
                {searchQuery ? 'No users found' : 'Start typing to search users'}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 10,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  userList: {
    padding: 20,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    marginTop: 2,
  },
  followButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
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

export default SearchUsersScreen;
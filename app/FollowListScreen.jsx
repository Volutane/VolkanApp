import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, db } from '../lib/firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { ThemeContext } from '../components/ThemeContext';
import { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';

const FollowListScreen = () => {
  const { type, userId } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user && userId) {
        fetchUsers(userId);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const fetchUsers = async (targetUserId) => {
    try {
      setLoading(true);
      const collectionName = type === 'followers' ? 'followers' : 'following';
      console.log('Fetching', type, 'for user:', targetUserId);
      
      const usersRef = collection(db, 'users', targetUserId, collectionName);
      console.log('Collection path:', usersRef.path);
      
      const snapshot = await getDocs(usersRef);
      console.log('Snapshot size:', snapshot.size);
      console.log('Snapshot docs:', snapshot.docs.map(doc => doc.id));
      
      const usersList = [];
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        console.log('User data for', docSnapshot.id, ':', data);
        
        // Get user document to get the latest username
        const userDocRef = doc(db, 'users', docSnapshot.id);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          console.warn(`User document not found for ID: ${docSnapshot.id}`);
          usersList.push({
            id: docSnapshot.id,
            username: data.username || 'Unknown User (Not Found)',
            timestamp: data.timestamp
          });
          continue;
        }

        const userData = userDocSnap.data();
        console.log('Fetched user data for', docSnapshot.id, ':', userData);
        
        const username = userData?.username || userData?.displayName || data.username || 'Unknown User';
        usersList.push({
          id: docSnapshot.id,
          username: username,
          timestamp: data.timestamp
        });
      }
      
      console.log('Final users list:', usersList);
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity 
      style={[styles.userCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => router.push({
        pathname: '/(Tabs)/profile',
        params: { userId: item.id }
      })}
    >
      <View style={styles.userInfo}>
        <Text style={[styles.username, { color: colors.text }]}>
          {item.username}
        </Text>
        <Text style={[styles.timestamp, { color: colors.secondaryText }]}>
          Added: {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {type === 'followers' ? 'Followers' : 'Following'}
        </Text>
        <View style={styles.backButton} />
      </View>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No {type} found
          </Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  userCard: {
    flexDirection: 'row',
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
  timestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default FollowListScreen;
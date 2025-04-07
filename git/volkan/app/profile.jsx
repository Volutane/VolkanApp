import { View, Text, ImageBackground, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import React, { useState } from 'react';

const { width, height } = Dimensions.get('window');

const Profile = () => {
  const [selectedTab, setSelectedTab] = useState('Games'); 

  
  const tabs = ['Games', 'Wishlist'];

  
  const gamesData = [
    { id: '1', title: 'Game 1' },
    { id: '2', title: 'Game 2' },
    { id: '3', title: 'Game 3' },
  ];

  const wishlistData = [
    { id: '1', title: 'Wishlist Game 1' },
    { id: '2', title: 'Wishlist Game 2' },
  ];

  
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardText}>{item.title}</Text>
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/images/Katman.png')} 
      style={[styles.container, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        
        <Image
          source={require('../assets/images/ay.jpg')} 
          style={styles.coverImage}
          resizeMode="cover"
        />

        
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar} />
          </View>
          <Text style={styles.username}>Orçun Gülay</Text>
          <Text style={styles.email}>orcun1@gmail.com</Text>
          <View style={styles.followStats}>
            <View style={styles.followItem}>
              <Text style={styles.followCount}>99</Text>
              <Text style={styles.followLabel}>Following</Text>
            </View>
            <View style={styles.followItem}>
              <Text style={styles.followCount}>9</Text>
              <Text style={styles.followLabel}>Followers</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        
        <View style={styles.tabMenu}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[
                styles.tabItem,
                selectedTab === tab && styles.tabItemActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        
        <FlatList
          data={selectedTab === 'Games' ? gamesData : wishlistData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2} 
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContainer}
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
  },
  coverImage: {
    width: '100%',
    height: 150, 
  },
  profileInfo: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    marginTop: -50, 
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2A3B44', 
    borderWidth: 3,
    borderColor: 'white',
  },
  username: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  email: {
    color: '#A9A9A9',
    fontSize: 16,
    marginTop: 5,
  },
  followStats: {
    flexDirection: 'row',
    marginTop: 10,
  },
  followItem: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  followCount: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  followLabel: {
    color: '#A9A9A9',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#1A2B34',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 15,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabMenu: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tabItem: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: 'white',
  },
  tabText: {
    color: '#A9A9A9',
    fontSize: 16,
  },
  tabTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, 
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: (width - 60) / 2, 
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;
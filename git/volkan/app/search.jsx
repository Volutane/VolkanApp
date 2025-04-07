import { View, Text, ImageBackground, StyleSheet, TextInput, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const Search = () => {
  const [selectedTab, setSelectedTab] = useState('Newest'); 

  
  const tabs = ['Newest', 'Popular', 'Most Liked', 'Recent'];

  
  const data = [
    { id: '1', title: 'Game 1', year: 2025 },
    { id: '2', title: 'Game 2', year: 2024 },
    { id: '3', title: 'Game 3', year: 2025 },
  ];

  
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardText}>{item.title}</Text>
      <Text style={styles.cardYear}>x ({item.year})</Text>
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
        
        <Text style={styles.headerText}>Find what you're looking for and more...</Text>

        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={24} color="#A9A9A9" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#A9A9A9"
          />
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
          data={data}
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
    padding: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2B34',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  tabMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tabItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#00FF00', 
  },
  tabText: {
    color: '#A9A9A9',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#00FF00', 
    fontWeight: 'bold',
  },
  listContainer: {
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
  cardYear: {
    color: '#A9A9A9',
    fontSize: 14,
  },
});

export default Search;
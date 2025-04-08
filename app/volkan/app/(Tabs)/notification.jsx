import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

const { width, height } = Dimensions.get('window');

const Notification = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('Friends');

  const tabs = ['Friends', 'You'];

  const friendsNotifications = [
    { id: '1', user: 'Orçun', status: 'Played', gameImage: require('../../assets/images/icon.png') },
    { id: '2', user: 'Orçun', status: 'Wants', gameImage: require('../../assets/images/icon.png') },
    { id: '3', user: 'Orçun', status: 'Played', gameImage: require('../../assets/images/icon.png') },
    { id: '4', user: 'Orçun', status: 'Wants', gameImage: require('../../assets/images/icon.png') },
  ];

  const yourNotifications = [
    { id: '1', user: 'You', status: 'Played', gameImage: require('../../assets/images/icon.png') },
    { id: '2', user: 'You', status: 'Wants', gameImage: require('../../assets/images/icon.png') },
  ];

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/GameDetailScreen', params: { game: JSON.stringify({ name: item.user, image: item.gameImage }) } })}
      style={styles.notificationCard}
    >
      <View style={styles.avatar} />
      <View style={styles.notificationContent}>
        <View style={styles.textContainer}>
          <Text style={styles.userText}>{item.user}</Text>
          <Text style={styles.statusText}> {item.status}</Text>
        </View>
        <Image source={item.gameImage} style={styles.gameImage} resizeMode="cover" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../assets/images/Katman.png')}
      style={[styles.container, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.headerText}>Notifications</Text>
        </View>

        
        <View style={styles.tabMenu}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={styles.tabItem}
            >
              <Text style={styles.tabText}>{tab}</Text>
              {selectedTab === tab && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        
        <FlatList
          data={selectedTab === 'Friends' ? friendsNotifications : yourNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.notificationList}
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
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabMenu: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'black',
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
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00',
    position: 'absolute',
    bottom: 2,
  },
  notificationList: {
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A2B34',
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
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#A9A9A9',
    fontSize: 14,
  },
  gameImage: {
    width: 60,
    height: 80,
    borderRadius: 5,
  },
});

export default Notification;
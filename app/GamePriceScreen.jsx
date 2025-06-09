import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';
import axios from 'axios';

const GamePriceScreen = () => {
  const router = useRouter();
  const { game } = useLocalSearchParams();
  const { colors, backgroundImage } = useContext(ThemeContext);

  const gameData = game ? JSON.parse(game) : { name: 'Counter Strike 2' };

  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState([]);
  const [storeMap, setStoreMap] = useState({});

  const fetchStores = async () => {
    try {
      const res = await axios.get('https://www.cheapshark.com/api/1.0/stores');
      const map = {};
      res.data.forEach((store) => {
        map[store.storeID] = store.storeName;
      });
      setStoreMap(map);
    } catch (err) {
      console.error('Mağazalar alınamadı:', err);
    }
  };

  const fetchCheapSharkPrices = async (title) => {
    try {
      const searchRes = await axios.get(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(title)}`);
      if (searchRes.data.length === 0) {
        console.log('Oyun için fiyat verisi bulunamadı:', title);
        return;
      }

      const gameID = searchRes.data[0].gameID;
      const dealRes = await axios.get(`https://www.cheapshark.com/api/1.0/games?id=${gameID}`);
      setDeals(dealRes.data.deals || []);
      console.log('Fiyat verileri:', dealRes.data.deals);
    } catch (error) {
      console.error('Fiyat verileri alınamadı:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const openStoreLink = async (dealID) => {
    const url = `https://www.cheapshark.com/redirect?dealID=${dealID}`;
    console.log('Açılacak URL:', url);
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Hata', 'Bu bağlantı açılamıyor. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (err) {
      console.error('Bağlantı açma hatası:', err);
      Alert.alert('Hata', 'Bağlantı açılamadı: ' + err.message);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchCheapSharkPrices(gameData.name);
  }, [gameData.name]);

  const renderPriceItem = ({ item }) => {
    const storeName = storeMap[item.storeID] || `Store #${item.storeID}`;
    return (
      <TouchableOpacity
        style={[styles.priceCard, { backgroundColor: colors.cardBackground }]}
        onPress={() => openStoreLink(item.dealID)}
      >
        <Text style={[styles.platformText, { color: colors.text }]}>{storeName}</Text>
        <Text style={[styles.priceText, { color: '#00FF00' }]}>
          ${item.price} → ${item.retailPrice}
        </Text>
      </TouchableOpacity>
    );
  };

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
            <Text style={[styles.headerText, { color: colors.text }]}>
              {gameData.name} - Prices
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#00FF00" />
          ) : deals.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.text }]}>Fiyat verisi bulunamadı.</Text>
          ) : (
            <FlatList
              data={deals}
              renderItem={renderPriceItem}
              keyExtractor={(item) => item.dealID}
              contentContainerStyle={styles.priceList}
              showsVerticalScrollIndicator={false}
            />
          )}
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
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  priceList: {
    paddingBottom: 60,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  platformText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default GamePriceScreen;
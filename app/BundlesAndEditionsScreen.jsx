import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';

const BundlesAndEditionsScreen = () => {
  const router = useRouter();
  const { game } = useLocalSearchParams();
  const { colors, backgroundImage } = useContext(ThemeContext);

  const parsedGame = game ? JSON.parse(game) : null;
  const { dlcs, expansions, bundles, gameId, gameName } = parsedGame || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const allItems = [
    ...(dlcs || []).map(item => ({ ...item, type: 'DLC' })),
    ...(expansions || []).map(item => ({ ...item, type: 'Expansion' })),
    ...(bundles || []).map(item => ({ ...item, type: 'Bundle' })),
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.gameCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => router.push({ pathname: '/GameDetailScreen', params: { game: JSON.stringify({ id: item.id, name: item.name }) } })}
    >
      <Image
        source={require('../assets/images/icon.png')} // Varsayılan ikon, eğer cover URL'si yoksa
        style={styles.gameImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderSection = (title, data) => {
    if (!data || data.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  return (
    <ImageBackground source={backgroundImage || { uri: 'https://via.placeholder.com/1080x1920' }} style={styles.container} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{gameName || 'Bundles & Editions'}</Text>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.accent }]} onPress={() => router.back()}>
              <Text style={[styles.retryButtonText, { color: colors.buttonText }]}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={[]}
            renderItem={() => null}
            ListHeaderComponent={() => (
              <>
                {renderSection('DLCs', dlcs)}
                {renderSection('Expansions', expansions)}
                {renderSection('Bundles', bundles)}
              </>
            )}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
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
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 10,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginHorizontal: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  gameCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gameImage: {
    width: '100',
    aspectRatio: 2/3,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default BundlesAndEditionsScreen;
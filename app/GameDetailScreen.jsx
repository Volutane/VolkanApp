import React, { useEffect, useState, useContext, useCallback, memo } from 'react';
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
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';
import { WebView } from 'react-native-webview';
import GameCommunityScreen from './GameCommunityScreen';
import { GestureHandlerRootView, PinchGestureHandler } from 'react-native-gesture-handler';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  query, 
  collection, 
  getDocs, 
  onSnapshot,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { getAuth } from 'firebase/auth';

// Yaş sınıflandırmasını okunabilir formata dönüştürme
const getAgeRatingLabel = (ageRating) => {
  if (!ageRating) return 'N/A';
  const { category, rating } = ageRating;

  // ESRB: category = 1, PEGI: category = 2
  if (category === 1) { // ESRB
    const esrbRatings = {
      1: 'RP (Rating Pending)',
      2: 'EC (Early Childhood)',
      3: 'E (Everyone)',
      4: 'E10+ (Everyone 10+)',
      5: 'T (Teen)',
      6: 'M (Mature 17+)',
      7: 'AO (Adults Only 18+)',
    };
    return esrbRatings[rating] || 'N/A';
  } else if (category === 2) { // PEGI
    const pegiRatings = {
      1: '3+',
      2: '7+',
      3: '12+',
      4: '16+',
      5: '18+',
    };
    return pegiRatings[rating] || 'N/A';
  }
  return 'N/A';
};

const fetchIgdbToken = async (clientId, clientSecret) => {
  try {
    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: 'POST' }
    );
    return (await response.json()).access_token;
  } catch (err) {
    console.error('IGDB Token Error:', err);
    throw err;
  }
};

const fetchGameDetailsFromIGDB = async (accessToken, clientId, gameId) => {
  const query = `
    fields name, summary, rating, genres.name, cover.*, screenshots.url, screenshots.image_id,
           similar_games.id, similar_games.name, similar_games.cover.*,
           involved_companies.company.name, involved_companies.developer,
           dlcs.name, dlcs.id, expansions.name, expansions.id, videos.video_id, videos.name,
           platforms.name, age_ratings.rating, age_ratings.category, game_modes.name, themes.name;
    where id = ${gameId};
    limit 1;
  `;

  try {
    const res = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      body: query,
    });
    const data = await res.json();
    console.log('Raw IGDB Response:', JSON.stringify(data[0], null, 2));
    
    if (data[0]) {
      // Process cover data
      if (data[0].cover) {
        if (data[0].cover.url) {
          data[0].cover.url = data[0].cover.url.replace('t_thumb', 't_1080p');
        } else if (data[0].cover.image_id) {
          data[0].cover.url = `https://images.igdb.com/igdb/image/upload/t_1080p/${data[0].cover.image_id}.jpg`;
        }
      }
      
      console.log('Processed game data:', JSON.stringify(data[0], null, 2));
    }
    
    return data[0] || null;
  } catch (err) {
    console.error('IGDB Game Details Error:', err);
    throw err;
  }
};

const getGameTypeLabel = (game) => {
  if (!game) return null;
  
  // Category values from IGDB API
  const categories = {
    0: 'main_game',
    1: 'dlc',
    2: 'expansion',
    3: 'bundle',
    4: 'standalone_expansion',
    5: 'mod',
    6: 'episode',
    7: 'season',
    8: 'remake',
    9: 'remaster',
    10: 'expanded_game',
    11: 'port',
    12: 'fork',
    13: 'pack',
    14: 'update'
  };

  const category = categories[game.category];
  if (!category || category === 'main_game') return null;

  // Map category to display label
  const labelMap = {
    'dlc': 'DLC',
    'expansion': 'Expansion',
    'bundle': 'Bundle',
    'standalone_expansion': 'Standalone',
    'mod': 'Mod',
    'episode': 'Episode',
    'season': 'Season',
    'remake': 'Remake',
    'remaster': 'Remaster',
    'expanded_game': 'Expanded',
    'port': 'Port',
    'fork': 'Fork',
    'pack': 'Pack',
    'update': 'Update'
  };

  return labelMap[category] || null;
};

const MemoizedWebView = memo(({ url }) => (
  <WebView
    source={{ uri: url }}
    style={styles.videoPlayer}
    javaScriptEnabled
    domStorageEnabled
    allowsInlineMediaPlayback
    allowsFullscreenVideo
    mediaPlaybackRequiresUserAction={false}
    startInLoadingState
    scrollEnabled={false}
    cacheEnabled={true}
    cacheMode="LOAD_CACHE_ELSE_NETWORK"
  />
));

const MemoizedVideoCard = memo(({ item, colors }) => (
  <View style={styles.videoCard}>
    <MemoizedWebView url={item.url} />
    <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
      {item.name}
    </Text>
  </View>
));

const ActionSheet = memo(({ visible, onClose, onAction, colors, isInWishlist, isPlayed }) => {
  const slideAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.actionSheet,
            {
              backgroundColor: colors.background,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.actionSheetHeader}>
            <View style={[styles.actionSheetIndicator, { backgroundColor: colors.secondaryText }]} />
          </View>
          <TouchableOpacity
            style={[styles.actionButton, { borderBottomColor: colors.border }]}
            onPress={() => onAction('wishlist')}
          >
            <Ionicons 
              name={isInWishlist ? "heart" : "heart-outline"} 
              size={24} 
              color={isInWishlist ? "#FF0000" : colors.text} 
            />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { borderBottomColor: colors.border }]}
            onPress={() => onAction('played')}
          >
            <Ionicons 
              name={isPlayed ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={24} 
              color={isPlayed ? "#00FF00" : colors.text} 
            />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              {isPlayed ? 'Remove from Played' : 'Mark as Played'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { borderBottomColor: colors.border }]}
            onPress={() => onAction('review')}
          >
            <Ionicons name="star-outline" size={24} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Rate & Review</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
});

const GameDetailScreen = () => {
  const router = useRouter();
  const { game } = useLocalSearchParams();
  const { colors, backgroundImage } = useContext(ThemeContext);

  const CLIENT_ID = 'z9muc6maorsvxnxxf33ooyq8yw68s7';
  const CLIENT_SECRET = 'vl8zon2et6hl53tj7a37ziz01t0f7q';

  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const [popularComments, setPopularComments] = useState([]);
  const slideAnim = useState(new Animated.Value(0))[0];
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isPlayed, setIsPlayed] = useState(false);
  const auth = getAuth();

  const parsedGame = game ? JSON.parse(game) : null;
  const gameId = parsedGame?.id;

  const platformMap = {
    'PC (Microsoft Windows)': 'PC',
    'PlayStation': 'PS',
    'Xbox': 'Xbox',
    'Nintendo Switch': 'Switch',
    'macOS': 'Mac',
    'Linux': 'Linux',
    'Android': 'Android',
    'iOS': 'iOS',
  };

  useEffect(() => {
    if (!gameId) return;

    const fetchGameData = async () => {
      try {
        setLoading(true);
        const accessToken = await fetchIgdbToken(CLIENT_ID, CLIENT_SECRET);
        const data = await fetchGameDetailsFromIGDB(accessToken, CLIENT_ID, gameId);
        if (data) {
          setGameData(data);
          if (data.videos?.length > 0) {
            const videoId = data.videos[0].video_id;
            setTrailerUrl(`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0&modestbranding=1`);
          }
        } else {
          setError('Game not found');
        }
      } catch (err) {
        setError('Failed to load game details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

  useEffect(() => {
    if (auth.currentUser && gameId) {
      checkGameStatus();
    }
  }, [auth.currentUser, gameId]);

  // Yorumları Firestore'dan çekme
  useEffect(() => {
    if (!gameId) return;

    const commentsQuery = query(
      collection(db, 'games', gameId.toString(), 'comments'),
      orderBy('likes', 'desc'),
      orderBy('date', 'desc'),
      limit(3)
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPopularComments(commentsList);
    }, (error) => {
      console.error('Error fetching comments:', error);
      setPopularComments([]);
    });

    return () => unsubscribe();
  }, [gameId]);

  const checkGameStatus = async () => {
    if (!auth.currentUser || !gameId) {
      console.log('No user or gameId available');
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      console.log('Checking game status for user:', userId, 'game:', gameId);

      const wishlistRef = doc(db, 'users', userId, 'wishlist', gameId.toString());
      const playedRef = doc(db, 'users', userId, 'played', gameId.toString());

      const [wishlistDoc, playedDoc] = await Promise.all([
        getDoc(wishlistRef),
        getDoc(playedRef)
      ]);

      console.log('Game status check results:', {
        wishlist: wishlistDoc.exists(),
        played: playedDoc.exists()
      });

      setIsInWishlist(wishlistDoc.exists());
      setIsPlayed(playedDoc.exists());
    } catch (error) {
      console.error('Error checking game status:', error);
      setIsInWishlist(false);
      setIsPlayed(false);
    }
  };

  const getCoverUrl = (coverData) => {
    if (!coverData) return null;
    
    if (coverData.image_id) {
      return `https://images.igdb.com/igdb/image/upload/t_1080p/${coverData.image_id}.jpg`;
    }
    
    if (coverData.url) {
      const urlParts = coverData.url.split('/');
      const imageId = urlParts[urlParts.length - 1].split('.')[0];
      return `https://images.igdb.com/igdb/image/upload/t_1080p/${imageId}.jpg`;
    }
    
    return null;
  };

  const toggleWishlist = async () => {
    if (!auth.currentUser) {
      router.push('/SignInScreen');
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const wishlistRef = doc(db, 'users', userId, 'wishlist', gameId.toString());

      if (isInWishlist) {
        await deleteDoc(wishlistRef);
        setIsInWishlist(false);
      } else {
        console.log('Current game data for wishlist:', {
          gameData,
          parsedGame,
          cover: gameData?.cover
        });

        let coverUrl = null;
        
        if (gameData?.cover) {
          if (gameData.cover.url) {
            coverUrl = `https:${gameData.cover.url}`;
          } else if (gameData.cover.image_id) {
            coverUrl = `https://images.igdb.com/igdb/image/upload/t_1080p/${gameData.cover.image_id}.jpg`;
          }
        }

        if (!coverUrl) {
          try {
            const accessToken = await fetchIgdbToken(CLIENT_ID, CLIENT_SECRET);
            const igdbData = await fetchGameDetailsFromIGDB(accessToken, CLIENT_ID, gameId);
            if (igdbData?.cover) {
              if (igdbData.cover.url) {
                coverUrl = `https:${igdbData.cover.url}`;
              } else if (igdbData.cover.image_id) {
                coverUrl = `https://images.igdb.com/igdb/image/upload/t_1080p/${igdbData.cover.image_id}.jpg`;
              }
            }
          } catch (error) {
            console.error('Error fetching cover from IGDB:', error);
          }
        }

        console.log('Final wishlist cover URL:', coverUrl);

        const gameDataToSave = {
          gameId: gameId,
          name: parsedGame.name,
          cover: coverUrl,
          addedAt: new Date().toISOString()
        };

        console.log('Saving wishlist game data:', gameDataToSave);

        await setDoc(wishlistRef, gameDataToSave);
        setIsInWishlist(true);

        const followersQuery = query(collection(db, 'users', userId, 'followers'));
        const followersSnapshot = await getDocs(followersQuery);
        
        const notificationPromises = followersSnapshot.docs.map(async (followerDoc) => {
          const notificationRef = doc(collection(db, 'users', followerDoc.id, 'notifications'));
          await setDoc(notificationRef, {
            type: 'added_to_wishlist',
            userId: userId,
            gameId: gameId,
            gameName: parsedGame.name,
            gameCover: coverUrl,
            timestamp: new Date().toISOString()
          });
        });

        await Promise.all(notificationPromises);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const togglePlayed = async () => {
    if (!auth.currentUser) {
      router.push('/SignInScreen');
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const playedRef = doc(db, 'users', userId, 'played', gameId.toString());

      if (isPlayed) {
        await deleteDoc(playedRef);
        setIsPlayed(false);
      } else {
        console.log('Current game data:', {
          gameData,
          parsedGame,
          cover: gameData?.cover
        });

        let coverUrl = null;
        
        if (gameData?.cover) {
          if (gameData.cover.url) {
            coverUrl = `https:${gameData.cover.url}`;
          } else if (gameData.cover.image_id) {
            coverUrl = `https://images.igdb.com/igdb/image/upload/t_1080p/${gameData.cover.image_id}.jpg`;
          }
        }

        if (!coverUrl) {
          try {
            const accessToken = await fetchIgdbToken(CLIENT_ID, CLIENT_SECRET);
            const igdbData = await fetchGameDetailsFromIGDB(accessToken, CLIENT_ID, gameId);
            if (igdbData?.cover) {
              if (igdbData.cover.url) {
                coverUrl = `https:${igdbData.cover.url}`;
              } else if (igdbData.cover.image_id) {
                coverUrl = `https://images.igdb.com/igdb/image/upload/t_1080p/${igdbData.cover.image_id}.jpg`;
              }
            }
          } catch (error) {
            console.error('Error fetching cover from IGDB:', error);
          }
        }

        console.log('Final cover URL:', coverUrl);

        const gameDataToSave = {
          gameId: gameId,
          name: parsedGame.name,
          cover: coverUrl,
          addedAt: new Date().toISOString()
        };

        console.log('Saving game data:', gameDataToSave);

        await setDoc(playedRef, gameDataToSave);
        setIsPlayed(true);

        const followersQuery = query(collection(db, 'users', userId, 'followers'));
        const followersSnapshot = await getDocs(followersQuery);
        
        const notificationPromises = followersSnapshot.docs.map(async (followerDoc) => {
          const notificationRef = doc(collection(db, 'users', followerDoc.id, 'notifications'));
          await setDoc(notificationRef, {
            type: 'added_to_played',
            userId: userId,
            gameId: gameId,
            gameName: parsedGame.name,
            gameCover: coverUrl,
            timestamp: new Date().toISOString()
          });
        });

        await Promise.all(notificationPromises);
      }
    } catch (error) {
      console.error('Error toggling played status:', error);
    }
  };

  const relatedGames = gameData?.similar_games?.slice(0, 10).map((game) => ({
    id: game.id.toString(),
    title: game.name,
    image: game.cover ? { uri: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` } : require('../assets/images/icon.png'),
  })) || [];

  const screenshots = gameData?.screenshots?.map((screenshot, index) => ({
    id: index.toString(),
    url: `https:${screenshot.url.replace('t_thumb', 't_1080p')}`,
  })) || [];

  const videos = gameData?.videos?.map((video, index) => ({
    id: index.toString(),
    videoId: video.video_id,
    name: video.name,
    url: `https://www.youtube.com/embed/${video.video_id}?autoplay=0&controls=1&rel=0&modestbranding=1`,
  })) || [];

  const developers = gameData?.involved_companies?.filter((company) => company.developer).map((company) => company.company.name) || ['Unknown'];

  const dlcsAndExpansions = [
    ...(gameData?.dlcs?.map((dlc) => ({ id: dlc.id.toString(), name: dlc.name })) || []),
    ...(gameData?.expansions?.map((expansion) => ({ id: expansion.id.toString(), name: expansion.name })) || []),
  ];

  const platforms = gameData?.platforms?.map((platform) => platformMap[platform.name] || platform.name || 'Unknown') || ['Not available'];

  const onPinchGestureEvent = (event) => {
    const newScale = Math.max(1, Math.min(3, event.nativeEvent.scale));
    setScale(newScale);
  };

  const renderScreenshot = ({ item, index }) => (
    <TouchableOpacity style={styles.screenshotCard} onPress={() => setSelectedScreenshotIndex(index)}>
      <Image source={{ uri: item.url }} style={styles.screenshotImage} resizeMode="cover" />
    </TouchableOpacity>
  );

  const renderVideo = useCallback(({ item }) => (
    <MemoizedVideoCard item={item} colors={colors} />
  ), [colors]);

  const keyExtractor = useCallback((item) => item.id, []);

  const getItemLayout = useCallback((data, index) => ({
    length: 280,
    offset: 280 * index,
    index,
  }), []);

  const renderFullScreenScreenshot = ({ item }) => (
    <View style={styles.fullScreenImageContainer}>
      <PinchGestureHandler onGestureEvent={onPinchGestureEvent}>
        <View style={styles.fullScreenImageContainer}>
          <Image
            source={{ uri: item.url }}
            style={[
              styles.fullScreenImage,
              {
                transform: [
                  { scale },
                  { translateX },
                  { translateY },
                ],
              },
            ]}
            resizeMode="contain"
          />
        </View>
      </PinchGestureHandler>
    </View>
  );

  const renderRelatedGame = ({ item }) => {
    const gameType = getGameTypeLabel(item);
    
    return (
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/GameDetailScreen', params: { game: JSON.stringify({ id: item.id, name: item.title }) } })}
        style={styles.relatedGameCard}
      >
        <View style={styles.relatedGameImageContainer}>
          <Image source={item.image} style={styles.relatedGameImage} resizeMode="cover" />
          {gameType && (
            <View style={[styles.typeLabel, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
              <Text style={styles.typeLabelText}>{gameType}</Text>
            </View>
          )}
          <View style={styles.relatedGameOverlay}>
            <Text style={styles.relatedGameTitle} numberOfLines={2}>{item.title}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderComment = ({ item }) => (
    <View style={[styles.commentCard, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.commentUser, { color: colors.text }]}>{item.username}</Text>
      <Text style={[styles.commentText, { color: colors.text }]}>{item.text}</Text>
      <Text style={[styles.commentMeta, { color: colors.secondaryText }]}>
        {item.platform} | {item.date} | {item.likes || 0} Likes
      </Text>
    </View>
  );

  const renderDlcOrExpansion = ({ item }) => (
    <View style={[styles.dlcCard, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.dlcText, { color: colors.text }]}>{item.name}</Text>
    </View>
  );

  const handleAction = useCallback((action) => {
    setIsActionSheetVisible(false);
    switch (action) {
      case 'wishlist':
        toggleWishlist();
        break;
      case 'played':
        togglePlayed();
        break;
      case 'review':
        router.push('/SignInScreen');
        break;
    }
  }, [router, isInWishlist, isPlayed]);

  const renderHeader = () => (
    <>
      <View style={styles.bannerContainer}>
        {trailerUrl ? (
          <WebView
            source={{ uri: trailerUrl }}
            style={styles.bannerVideo}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            startInLoadingState
            scrollEnabled={false}
          />
        ) : gameData?.cover ? (
          <>
            <Image source={{ uri: `https:${gameData.cover.url.replace('t_thumb', 't_1080p')}` }} style={styles.bannerImage} resizeMode="cover" />
            <View style={styles.bannerOverlay} />
          </>
        ) : (
          <>
            <Image source={require('../assets/images/ay.jpg')} style={styles.bannerImage} resizeMode="cover" />
            <View style={styles.bannerOverlay} />
          </>
        )}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.titleContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.gameTitle, { color: colors.text }]}>{gameData?.name || parsedGame?.name || 'Game'}</Text>
          {getGameTypeLabel(parsedGame) && (
            <View style={[styles.typeLabel, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
              <Text style={styles.typeLabelText}>{getGameTypeLabel(parsedGame)}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.platformPriceContainer}>
        <View style={styles.platformContainer}>
          {platforms.map((platform, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push({ pathname: '/PlatformPopularGamesScreen', params: { platform } })}
              style={styles.platformButton}
            >
              <Text style={[styles.platformText, { color: colors.secondaryText }]}>{platform}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.priceRatingRow}>
          <TouchableOpacity onPress={() => router.push({ pathname: '/GamePriceScreen', params: { game: JSON.stringify({ name: gameData?.name || parsedGame?.name }) } })}>
            <Text style={[styles.priceText, { color: '#00FF00' }]}>Prices</Text>
          </TouchableOpacity>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" style={styles.starIcon} />
            <Text style={[styles.ratingText, { color: colors.text }]}>{gameData?.rating ? (gameData.rating / 10).toFixed(1) : 'N/A'}</Text>
          </View>
          {isPlayed && (
            <View style={styles.statusContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#00FF00" style={styles.statusIcon} />
              <Text style={[styles.statusText, { color: colors.text }]}>Played</Text>
            </View>
          )}
          {isInWishlist && (
            <View style={styles.statusContainer}>
              <Ionicons name="heart" size={16} color="#FF0000" style={styles.statusIcon} />
              <Text style={[styles.statusText, { color: colors.text }]}>Wishlist</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.buttonBackground }]}
          onPress={() => setIsActionSheetVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.buttonText} />
          <Text style={[styles.addButtonText, { color: colors.buttonText }]}>Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Screenshots</Text>
      {screenshots.length > 0 ? (
        <FlatList
          data={screenshots}
          renderItem={renderScreenshot}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.screenshotList}
        />
      ) : (
        <Text style={[styles.emptyText, { color: colors.text }]}>No screenshots available</Text>
      )}

      {videos.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Videos</Text>
          <FlatList
            data={videos}
            renderItem={renderVideo}
            keyExtractor={keyExtractor}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.videoList}
            removeClippedSubviews={true}
            maxToRenderPerBatch={3}
            windowSize={3}
            initialNumToRender={2}
            getItemLayout={getItemLayout}
            updateCellsBatchingPeriod={50}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
          />
        </>
      )}

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Release date</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{gameData?.release_dates?.[0]?.human || 'Unknown'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Genre</Text>
            <View style={styles.genreContainer}>
              {gameData?.genres?.slice(0, 2).map((genre, index) => (
                <TouchableOpacity key={index} onPress={() => router.push({ pathname: '/GenreGamesScreen', params: { genreName: genre.name } })}>
                  <Text style={[styles.genreText, { color: colors.text, backgroundColor: colors.cardBackground }]}>{genre.name}</Text>
                </TouchableOpacity>
              )) || <Text style={[styles.genreText, { color: colors.text }]}>Unknown</Text>}
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Developer</Text>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/DeveloperGamesScreen', params: { developerName: gameData?.involved_companies?.[0]?.company?.name || 'Unknown' } })}
            >
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {gameData?.involved_companies?.[0]?.company?.name || 'Unknown'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Age Rating</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {gameData?.age_ratings?.length > 0 ? getAgeRatingLabel(gameData.age_ratings[0]) : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Game Modes</Text>
            <View style={styles.genreContainer}>
              {gameData?.game_modes?.map((mode, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => router.push({ pathname: '/GameModeGamesScreen', params: { gameModeName: mode.name } })}
                >
                  <Text style={[styles.genreText, { color: colors.text, backgroundColor: colors.cardBackground }]}>{mode.name}</Text>
                </TouchableOpacity>
              )) || <Text style={[styles.genreText, { color: colors.text }]}>N/A</Text>}
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Themes</Text>
            <View style={styles.genreContainer}>
              {gameData?.themes?.map((theme, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => router.push({ pathname: '/ThemeGamesScreen', params: { themeName: theme.name } })}
                >
                  <Text style={[styles.genreText, { color: colors.text, backgroundColor: colors.cardBackground }]}>{theme.name}</Text>
                </TouchableOpacity>
              )) || <Text style={[styles.genreText, { color: colors.text }]}>N/A</Text>}
            </View>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
      <Text style={[styles.description, { color: colors.text }]}>{gameData?.summary || 'No description available.'}</Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>DLCs & Expansions</Text>
      {dlcsAndExpansions.length > 0 ? (
        <FlatList
          data={dlcsAndExpansions}
          renderItem={renderDlcOrExpansion}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dlcList}
        />
      ) : (
        <Text style={[styles.emptyText, { color: colors.text }]}>No DLCs or expansions available</Text>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Related Games</Text>
      {relatedGames.length > 0 ? (
        <FlatList
          data={relatedGames}
          renderItem={renderRelatedGame}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.relatedGamesList}
        />
      ) : (
        <Text style={[styles.emptyText, { color: colors.text }]}>No related games available</Text>
      )}

      <View style={styles.commentsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Comments</Text>
        {popularComments.length > 0 ? (
          <FlatList
            data={popularComments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.commentList}
          />
        ) : (
          <Text style={[styles.emptyText, { color: colors.text }]}>No comments yet.</Text>
        )}
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/GameCommentsScreen', params: { game: JSON.stringify(gameData || parsedGame) } })}
          style={[styles.loadMoreButton, { backgroundColor: colors.buttonBackground }]}
        >
          <Text style={[styles.loadMoreText, { color: colors.buttonText }]}>Load All Comments</Text>
        </TouchableOpacity>
      </View>

      <GameCommunityScreen gameId={gameId?.toString()} gameName={gameData?.name || parsedGame?.name} />
    </>
  );

  return (
    <ImageBackground source={backgroundImage || { uri: 'https://via.placeholder.com/1080x1920' }} style={styles.container} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.accent }]} onPress={() => router.replace('/')}>
              <Text style={[styles.retryButtonText, { color: colors.buttonText }]}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList data={[]} renderItem={() => null} ListHeaderComponent={renderHeader} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} />
            <Modal
              animationType="fade"
              transparent={true}
              visible={selectedScreenshotIndex !== null}
              onRequestClose={() => {
                setSelectedScreenshotIndex(null);
                setScale(1);
                setTranslateX(0);
                setTranslateY(0);
              }}
            >
              <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.modalContainer}>
                  <FlatList
                    data={screenshots}
                    renderItem={renderFullScreenScreenshot}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    initialScrollIndex={selectedScreenshotIndex}
                    getItemLayout={(data, index) => ({
                      length: Dimensions.get('window').width,
                      offset: Dimensions.get('window').width * index,
                      index,
                    })}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedScreenshotIndex(null);
                      setScale(1);
                      setTranslateX(0);
                      setTranslateY(0);
                    }}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={colors.buttonText} />
                  </TouchableOpacity>
                </View>
              </GestureHandlerRootView>
            </Modal>
            <ActionSheet
              visible={isActionSheetVisible}
              onClose={() => setIsActionSheetVisible(false)}
              onAction={handleAction}
              colors={colors}
              isInWishlist={isInWishlist}
              isPlayed={isPlayed}
            />
          </>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: 60,
  },
  bannerContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
    marginBottom: 20,
  },
  bannerVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  titleContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 10,
  },
  typeLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  platformPriceContainer: {
    marginBottom: 15,
    marginHorizontal: 20,
  },
  platformContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  platformButton: {
    marginRight: 10,
  },
  platformText: {
    fontSize: 16,
  },
  priceRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 5,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginHorizontal: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  screenshotList: {
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  screenshotCard: {
    width: 280,
    height: 157.5,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  screenshotImage: {
    width: '100%',
    height: '100%',
  },
  relatedGamesList: {
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  relatedGameCard: {
    width: 160,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  relatedGameImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  relatedGameImage: {
    width: '100%',
    height: '100%',
  },
  relatedGameOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  relatedGameTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dlcList: {
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  dlcCard: {
    width: 200,
    marginRight: 15,
    borderRadius: 10,
    padding: 10,
  },
  dlcText: {
    fontSize: 14,
  },
  commentsSection: {
    marginBottom: 20,
  },
  commentList: {
    paddingHorizontal: 20,
  },
  commentCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  commentMeta: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  loadMoreButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: 'bold',
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImageContainer: {
    width: Dimensions.get('window').width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  actionSection: {
    marginHorizontal: 20,
    marginVertical: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreText: {
    fontSize: 14,
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 5,
  },
  videoList: {
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  videoCard: {
    width: 280,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  videoPlayer: {
    width: '100%',
    height: 157.5,
    backgroundColor: '#000',
  },
  videoTitle: {
    fontSize: 14,
    marginTop: 8,
    paddingHorizontal: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  actionSheetHeader: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionSheetIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    marginLeft: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  statusIcon: {
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default GameDetailScreen;
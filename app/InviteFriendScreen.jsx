import { View, Text, ImageBackground, StyleSheet, TextInput, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../components/ThemeContext';

const { width, height } = Dimensions.get('window');

const InviteFriendScreen = () => {
  const router = useRouter();
  const { colors, backgroundImage } = useContext(ThemeContext);
  const [email, setEmail] = useState('');

  const handleInvite = () => {
    console.log('Invite sent to:', email);
    setEmail('');
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={[styles.container, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerText, { color: colors.text }]}>Invite a Friend</Text>
          </View>
          <View style={[styles.form, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.label, { color: colors.text }]}>Friend's Email</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.buttonBackground }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              placeholderTextColor={colors.secondaryText}
            />
            <TouchableOpacity
              style={[styles.inviteButton, { backgroundColor: colors.buttonBackground }]}
              onPress={handleInvite}
            >
              <Text style={[styles.inviteButtonText, { color: colors.buttonText }]}>Send Invite</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    marginLeft: 15,
  },
  form: {
    borderRadius: 10,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  inviteButton: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InviteFriendScreen;
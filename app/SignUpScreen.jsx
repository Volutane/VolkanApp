import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signup, updateProfile } from '../services/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';

export default function SignUpScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signup(email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      await setDoc(doc(db, 'users', user.uid), {
        email,
        username: username.toLowerCase(),
        createdAt: new Date().toISOString(),
      });

      router.replace('/(Tabs)/home');
    } catch (error) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>

      <View style={styles.inputWrapper}>
        <MaterialIcons name="email" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons name="person" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Kullanıcı Adı"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor="#aaa"
          secureTextEntry={hidePassword}
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={22} color="#888" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/SignInScreen')}>
        <Text style={styles.linkText}>
          Zaten hesabınız var mı? <Text style={styles.link}>Giriş Yap</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  icon: {
    marginRight: 4,
  },
  button: {
    backgroundColor: '#00FF00',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#00FF00',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#ccc',
    fontSize: 14,
  },
  link: {
    color: '#00FF00',
    fontWeight: 'bold',
  },
});

// SignInScreen.jsx

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
import { login } from '../services/auth';

export default function SignInScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const handleSignIn = async () => {
    try {
      await login(email, password);
      router.replace('/(Tabs)/home');
    } catch (error) {
      Alert.alert('Hata', 'Giriş başarısız: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>

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
        />
        <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons
            name={hidePassword ? 'eye-off' : 'eye'}
            size={22}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/SignUpScreen')}>
        <Text style={styles.linkText}>
          Hesabınız yok mu? <Text style={styles.link}>Kayıt Ol</Text>
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
    padding: 24,
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
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    color: '#ccc',
    marginTop: 24,
    textAlign: 'center',
  },
  link: {
    color: '#00FF00',
    fontWeight: 'bold',
  },
});

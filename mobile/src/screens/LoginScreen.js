import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { loginApi } from '../config/auth';
import { COLORS, S } from './shared';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError('กรุณากรอก Username และ Password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await loginApi(username.trim(), password);
      onLogin(data.user || { username });
    } catch (e) {
      setError(e.message || 'Username หรือ Password ไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Logo */}
      <View style={styles.logoArea}>
        <Text style={styles.logoIcon}>📦</Text>
        <Text style={styles.logoTitle}>Samila WMS 3PL</Text>
        <Text style={styles.logoSub}>Warehouse Management System</Text>
      </View>

      {/* Form */}
      <View style={styles.card}>
        <Text style={[S.label, { marginBottom: 10 }]}>USERNAME</Text>
        <TextInput
          style={S.input}
          placeholder="กรอก Username"
          placeholderTextColor={COLORS.placeholder}
          value={username}
          onChangeText={t => { setUsername(t); setError(''); }}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={[S.label, { marginTop: 16, marginBottom: 10 }]}>PASSWORD</Text>
        <View style={styles.passRow}>
          <TextInput
            style={[S.input, { flex: 1 }]}
            placeholder="กรอก Password"
            placeholderTextColor={COLORS.placeholder}
            value={password}
            onChangeText={t => { setPassword(t); setError(''); }}
            secureTextEntry={!showPass}
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(v => !v)}>
            <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.loginBtn, loading && S.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.loginBtnText}>🔑 เข้าสู่ระบบ</Text>
          }
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Samila Innovation Co., Ltd. · v1.0.0</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoArea: { alignItems: 'center', marginBottom: 36 },
  logoIcon:  { fontSize: 56 },
  logoTitle: { fontSize: 24, fontWeight: '800', color: COLORS.cyan, marginTop: 12, letterSpacing: 1 },
  logoSub:   { fontSize: 13, color: COLORS.textSub, marginTop: 4 },

  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passRow:  { flexDirection: 'row', alignItems: 'center' },
  eyeBtn:   { marginLeft: 8, padding: 12, backgroundColor: 'rgba(0,229,255,0.1)', borderRadius: 8 },
  eyeIcon:  { fontSize: 18 },

  errorBox: { backgroundColor: 'rgba(255,107,107,0.12)', borderRadius: 8, padding: 10, marginTop: 12 },
  errorText: { color: '#FF6B6B', fontSize: 13 },

  loginBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  footer: { color: COLORS.textSub, fontSize: 11, marginTop: 32 },
});

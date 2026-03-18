import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import './src/i18n/i18n';
import { loadSavedLanguage } from './src/i18n/i18n';
import MobileNavigator from './src/navigation/MobileNavigator';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSavedLanguage().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <Text style={styles.logo}>📦</Text>
        <Text style={styles.title}>SAMILA WMS 3PL</Text>
        <ActivityIndicator color="#00E5FF" size="large" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return <MobileNavigator />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#0a1628',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo:  { fontSize: 56 },
  title: { fontSize: 22, fontWeight: '700', color: '#00E5FF', marginTop: 12, letterSpacing: 1 },
});

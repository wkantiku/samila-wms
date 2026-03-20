import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, StyleSheet, ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { API } from '../config/api';
import { S, COLORS, Header, PermissionScreen, ScannerModal } from './shared';

export default function ReceivingScreen() {
  const { t, i18n } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [grNumber,     setGrNumber]     = useState('');
  const [barcode,      setBarcode]      = useState('');
  const [quantity,     setQuantity]     = useState('');
  const [location,     setLocation]     = useState('');
  const [items,        setItems]        = useState([]);
  const [scanning,     setScanning]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const qtyRef = useRef(null);

  const toggleLang = async () => {
    const next = i18n.language === 'th' ? 'en' : 'th';
    await i18n.changeLanguage(next);
    await AsyncStorage.setItem('language', next);
  };

  const onScan = (e) => {
    setBarcode(e.data);
    setScanning(false);
    setTimeout(() => qtyRef.current?.focus(), 100);
  };

  const addItem = () => {
    if (!barcode || !quantity || !location) {
      Alert.alert(t('common.warning'), t('receiving.fillWarning'));
      return;
    }
    setItems(prev => [...prev, {
      id: Date.now(),
      barcode,
      quantity: parseFloat(quantity) || 0,
      location,
    }]);
    setBarcode('');
    setQuantity('');
    setLocation('');
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const submit = () => {
    if (!grNumber || items.length === 0) {
      Alert.alert(t('common.warning'), t('receiving.emptyWarning'));
      return;
    }
    const body = t('receiving.confirmBody')
      .replace('{gr}', grNumber)
      .replace('{count}', items.length);
    Alert.alert(t('receiving.confirmSubmit'), body, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), onPress: doSubmit },
    ]);
  };

  const doSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(API.receivingComplete, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gr_id: grNumber, items }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        Alert.alert(t('common.success'), json.message || t('common.success'));
        setGrNumber(''); setItems([]);
      } else {
        Alert.alert(t('common.error'), json.message || t('common.error'));
      }
    } catch {
      Alert.alert(t('common.error'), 'Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  if (!permission?.granted) {
    return <PermissionScreen onGrant={requestPermission} t={t} />;
  }

  return (
    <View style={S.screen}>
      <Header title={t('receiving.title')} subtitle={t('receiving.subtitle')} lang={i18n.language} onToggleLang={toggleLang} />

      <ScrollView style={S.scroll} keyboardShouldPersistTaps="handled">

        {/* GR Number */}
        <View style={S.card}>
          <Text style={S.label}>{t('receiving.grNumber')}</Text>
          <TextInput
            style={S.input}
            placeholder={t('receiving.grPlaceholder')}
            placeholderTextColor={COLORS.placeholder}
            value={grNumber}
            onChangeText={setGrNumber}
            autoCapitalize="characters"
          />
        </View>

        {/* Scanner */}
        <ScannerModal visible={scanning} onScan={onScan} onClose={() => setScanning(false)} />

        {/* Barcode */}
        <View style={S.card}>
          <Text style={S.label}>{t('receiving.scanItem')}</Text>
          <View style={styles.row}>
            <TextInput
              style={[S.input, { flex: 1 }]}
              placeholder={t('common.tapToScan')}
              placeholderTextColor={COLORS.placeholder}
              value={barcode}
              onChangeText={setBarcode}
            />
            <TouchableOpacity style={styles.camBtn} onPress={() => setScanning(true)}>
              <Text style={styles.camIcon}>📷</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Qty + Location */}
        <View style={[S.card, styles.row]}>
          <View style={{ flex: 1 }}>
            <Text style={S.label}>{t('receiving.quantity')}</Text>
            <TextInput
              ref={qtyRef}
              style={S.input}
              placeholder="0"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="decimal-pad"
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1.5 }}>
            <Text style={S.label}>{t('receiving.location')}</Text>
            <TextInput
              style={S.input}
              placeholder={t('receiving.locationPlaceholder')}
              placeholderTextColor={COLORS.placeholder}
              value={location}
              onChangeText={setLocation}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity style={[S.btn, S.btnGreen]} onPress={addItem}>
          <Text style={S.btnText}>➕ {t('receiving.addItem')}</Text>
        </TouchableOpacity>

        {/* Items List */}
        {items.length > 0 && (
          <View style={S.card}>
            <Text style={S.sectionTitle}>{t('receiving.scannedItems')} ({items.length})</Text>
            {items.map((item, idx) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemNum}><Text style={styles.itemNumText}>{idx + 1}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemBarcode}>{item.barcode}</Text>
                  <Text style={styles.itemMeta}>{t('common.qty')}: <Text style={{ color: COLORS.green }}>{item.quantity}</Text>  {t('common.location')}: <Text style={{ color: COLORS.cyan }}>{item.location}</Text></Text>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.delBtn}>
                  <Text style={styles.delIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[S.btn, S.btnPrimary, loading && S.btnDisabled]}
          onPress={submit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={S.btnText}>✅ {t('receiving.submit')}</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'flex-end' },
  camBtn:    { backgroundColor: COLORS.green, width: 50, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  camIcon:   { fontSize: 22 },
  itemRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,229,255,0.08)' },
  itemNum:   { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,229,255,0.12)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  itemNumText: { color: COLORS.cyan, fontSize: 12, fontWeight: '700' },
  itemBarcode: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  itemMeta:  { color: COLORS.textSub, fontSize: 12, marginTop: 2 },
  delBtn:    { padding: 8 },
  delIcon:   { color: COLORS.danger, fontSize: 16, fontWeight: '700' },
});

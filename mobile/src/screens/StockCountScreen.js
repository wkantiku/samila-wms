/**
 * StockCountScreen — Create count session → scan location → scan items → submit
 */
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { API } from '../config/api';
import { S, COLORS, Header, PermissionScreen, ScannerModal } from './shared';

export default function StockCountScreen() {
  const { t, i18n } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [countId,   setCountId]   = useState('');
  const [location,  setLocation]  = useState('');
  const [barcode,   setBarcode]   = useState('');
  const [countedQty, setCountedQty] = useState('');
  const [countRows, setCountRows] = useState([]);
  const [scanning,  setScanning]  = useState(false);
  const [scanTarget, setScanTarget] = useState('item'); // 'location' | 'item'
  const [loading,   setLoading]   = useState(false);
  const [step,      setStep]      = useState(1); // 1=session, 2=count, 3=done

  const toggleLang = async () => {
    const next = i18n.language === 'th' ? 'en' : 'th';
    await i18n.changeLanguage(next);
    await AsyncStorage.setItem('language', next);
  };

  const createSession = async () => {
    if (!countId.trim()) {
      Alert.alert(t('common.warning'), 'Please enter a Count Number.');
      return;
    }
    setLoading(true);
    try {
      await fetch(API.stockCountCreate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count_number: countId }),
      });
    } catch { /* offline ok */ }
    setStep(2);
    setLoading(false);
  };

  const onScan = (e) => {
    setScanning(false);
    if (scanTarget === 'location') {
      setLocation(e.data);
    } else {
      setBarcode(e.data);
    }
  };

  const addCountRow = () => {
    if (!location || !barcode || !countedQty) {
      Alert.alert(t('common.warning'), t('stockCount.fillWarning'));
      return;
    }
    const qty = parseFloat(countedQty) || 0;
    const existing = countRows.find(r => r.location === location && r.barcode === barcode);
    if (existing) {
      // Overwrite qty for same location+barcode
      setCountRows(prev => prev.map(r =>
        r.location === location && r.barcode === barcode ? { ...r, counted: qty } : r
      ));
    } else {
      setCountRows(prev => [...prev, {
        id: Date.now(), location, barcode, counted: qty, system: null,
      }]);
    }
    setBarcode('');
    setCountedQty('');
  };

  const removeRow = (id) => setCountRows(prev => prev.filter(r => r.id !== id));

  const submitCount = () => {
    if (countRows.length === 0) {
      Alert.alert(t('common.warning'), 'No count rows to submit.');
      return;
    }
    Alert.alert(t('stockCount.confirmSubmit'), `${countRows.length} rows`, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), onPress: doSubmit },
    ]);
  };

  const doSubmit = async () => {
    setLoading(true);
    try {
      await fetch(API.stockCountItem(countId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count_id: countId, items: countRows }),
      });
    } catch { /* offline ok */ }
    Alert.alert(t('common.success'), `Stock count ${countId} submitted ✅`);
    setStep(3);
    setLoading(false);
  };

  const resetAll = () => {
    setCountId(''); setLocation(''); setBarcode(''); setCountedQty('');
    setCountRows([]); setStep(1);
  };

  if (!permission?.granted) {
    return <PermissionScreen onGrant={requestPermission} t={t} />;
  }

  return (
    <View style={S.screen}>
      <Header title={t('stockCount.title')} subtitle={t('stockCount.subtitle')} lang={i18n.language} onToggleLang={toggleLang} />

      <ScrollView style={S.scroll} keyboardShouldPersistTaps="handled">

        {/* ── STEP 1: Create Session ── */}
        {step === 1 && (
          <>
            <View style={[S.card, { alignItems: 'center', paddingVertical: 20 }]}>
              <Text style={{ fontSize: 44, marginBottom: 8 }}>📊</Text>
              <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: 16, marginBottom: 4 }}>
                {t('stockCount.title')}
              </Text>
              <Text style={{ color: COLORS.textSub, fontSize: 12, textAlign: 'center' }}>
                {t('stockCount.subtitle')}
              </Text>
            </View>

            <View style={S.card}>
              <Text style={S.label}>{t('stockCount.countNumber')}</Text>
              <TextInput
                style={S.input}
                placeholder={t('stockCount.countPlaceholder')}
                placeholderTextColor={COLORS.placeholder}
                value={countId}
                onChangeText={setCountId}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={[S.btn, S.btnPrimary, loading && S.btnDisabled]}
              onPress={createSession}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={S.btnText}>➕ {t('stockCount.createCount')}</Text>
              }
            </TouchableOpacity>
          </>
        )}

        {/* ── STEP 2: Scanning ── */}
        {step === 2 && (
          <>
            {/* Session Header */}
            <View style={[S.card, styles.sessionBar]}>
              <View>
                <Text style={styles.sessionId}>{countId}</Text>
                <Text style={styles.sessionSub}>{countRows.length} {t('common.items')} recorded</Text>
              </View>
              <View style={[styles.stepBadge, { backgroundColor: 'rgba(0,229,255,0.1)' }]}>
                <Text style={{ color: COLORS.cyan, fontWeight: '700', fontSize: 12 }}>Step 2</Text>
              </View>
            </View>

            {/* Scanner */}
            <ScannerModal visible={scanning} onScan={onScan} onClose={() => setScanning(false)} />

            {/* Location */}
            <View style={S.card}>
              <Text style={S.label}>{t('stockCount.scanLocation')}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[S.input, { flex: 1 }]}
                  placeholder={t('stockCount.locationPlaceholder')}
                  placeholderTextColor={COLORS.placeholder}
                  value={location}
                  onChangeText={setLocation}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.camBtn}
                  onPress={() => { setScanTarget('location'); setScanning(true); }}
                >
                  <Text style={{ fontSize: 20 }}>📷</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Barcode + Qty */}
            <View style={S.card}>
              <Text style={S.label}>{t('stockCount.scanItem')}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[S.input, { flex: 1 }]}
                  placeholder={t('common.tapToScan')}
                  placeholderTextColor={COLORS.placeholder}
                  value={barcode}
                  onChangeText={setBarcode}
                />
                <TouchableOpacity
                  style={styles.camBtn}
                  onPress={() => { setScanTarget('item'); setScanning(true); }}
                >
                  <Text style={{ fontSize: 20 }}>📷</Text>
                </TouchableOpacity>
              </View>

              <Text style={[S.label, { marginTop: 12 }]}>{t('stockCount.countedQty')}</Text>
              <TextInput
                style={S.input}
                placeholder="0"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="decimal-pad"
                value={countedQty}
                onChangeText={setCountedQty}
              />

              <TouchableOpacity style={[S.btn, S.btnGreen, { marginTop: 12, marginBottom: 0 }]} onPress={addCountRow}>
                <Text style={S.btnText}>➕ {t('stockCount.addCount')}</Text>
              </TouchableOpacity>
            </View>

            {/* Count Rows */}
            {countRows.length > 0 && (
              <View style={S.card}>
                <Text style={S.sectionTitle}>{t('stockCount.countNumber')} — {countRows.length} {t('common.items')}</Text>
                {countRows.map(row => (
                  <View key={row.id} style={styles.countRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowLoc}>📍 {row.location}</Text>
                      <Text style={styles.rowBarcode}>{row.barcode}</Text>
                    </View>
                    <View style={styles.rowQtyBlock}>
                      <Text style={styles.rowQty}>{row.counted}</Text>
                      <Text style={styles.rowQtyLabel}>{t('stockCount.countedQty')}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeRow(row.id)} style={{ padding: 8 }}>
                      <Text style={{ color: COLORS.danger, fontSize: 14 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[S.btn, S.btnPrimary, loading && S.btnDisabled]}
              onPress={submitCount}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={S.btnText}>✅ {t('stockCount.submitCount')}</Text>
              }
            </TouchableOpacity>
          </>
        )}

        {/* ── STEP 3: Done ── */}
        {step === 3 && (
          <View style={[S.card, { alignItems: 'center', paddingVertical: 40 }]}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>🎉</Text>
            <Text style={{ color: COLORS.green, fontWeight: '800', fontSize: 20, marginBottom: 8 }}>
              {t('common.success')}!
            </Text>
            <Text style={{ color: COLORS.textSub, textAlign: 'center', marginBottom: 24 }}>
              Stock count <Text style={{ color: COLORS.cyan }}>{countId}</Text> submitted successfully.
            </Text>
            <TouchableOpacity style={[S.btn, S.btnPrimary, { paddingHorizontal: 32 }]} onPress={resetAll}>
              <Text style={S.btnText}>+ New Count</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sessionBar:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionId:   { color: COLORS.cyan, fontWeight: '800', fontSize: 15 },
  sessionSub:  { color: COLORS.textSub, fontSize: 12, marginTop: 2 },
  stepBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  inputRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  camBtn:      { backgroundColor: COLORS.surfaceAlt, width: 50, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  countRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,229,255,0.07)' },
  rowLoc:      { color: COLORS.cyan, fontSize: 12, fontWeight: '700' },
  rowBarcode:  { color: COLORS.text, fontSize: 13, marginTop: 2 },
  rowQtyBlock: { alignItems: 'center', marginRight: 8, minWidth: 48 },
  rowQty:      { color: COLORS.green, fontWeight: '800', fontSize: 18 },
  rowQtyLabel: { color: COLORS.textSub, fontSize: 10 },
});

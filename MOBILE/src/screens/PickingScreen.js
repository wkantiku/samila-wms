/**
 * PickingScreen — Load pick list → scan items one-by-one → complete
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

// Demo pick lists (replace with API call in production)
const DEMO_PICKS = {
  'PICK-2026-0001': {
    id: 'PICK-2026-0001',
    soNumber: 'SO-2026-0001',
    customer: 'Nayong Hospital',
    items: [
      { id: 1, sku: 'SKU-001', barcode: '8850000001', location: 'A-01-1', toPick: 20, picked: 0, unit: 'PCS' },
      { id: 2, sku: 'SKU-002', barcode: '8850000002', location: 'B-02-1', toPick: 10, picked: 0, unit: 'BOX' },
    ],
  },
  'PICK-2026-0002': {
    id: 'PICK-2026-0002',
    soNumber: 'SO-2026-0002',
    customer: 'ThaiBev Co.',
    items: [
      { id: 3, sku: 'SKU-003', barcode: '8850000003', location: 'C-01-2', toPick: 50, picked: 0, unit: 'KG' },
    ],
  },
};

export default function PickingScreen() {
  const { t, i18n } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [pickNumber, setPickNumber] = useState('');
  const [pickData,   setPickData]   = useState(null);
  const [scanning,   setScanning]   = useState(false);
  const [scanQty,    setScanQty]    = useState('1');
  const [loading,    setLoading]    = useState(false);

  const toggleLang = async () => {
    const next = i18n.language === 'th' ? 'en' : 'th';
    await i18n.changeLanguage(next);
    await AsyncStorage.setItem('language', next);
  };

  const loadPickList = async () => {
    const key = pickNumber.trim().toUpperCase();
    // Demo lookup — swap for API in production
    const found = DEMO_PICKS[key];
    if (found) {
      setPickData(JSON.parse(JSON.stringify(found))); // deep copy
    } else {
      Alert.alert(t('common.error'), `Pick list "${key}" not found.`);
    }
  };

  const onScanItem = (e) => {
    setScanning(false);
    const bc = e.data;
    const item = pickData?.items.find(i => i.barcode === bc || i.sku === bc);
    if (!item) {
      Alert.alert(t('common.warning'), `Barcode "${bc}" not in this pick list.`);
      return;
    }
    const qty = parseFloat(scanQty) || 1;
    const remaining = item.toPick - item.picked;
    if (remaining <= 0) {
      Alert.alert(t('common.warning'), `${item.sku} already fully picked.`);
      return;
    }
    const add = Math.min(qty, remaining);
    setPickData(prev => ({
      ...prev,
      items: prev.items.map(i =>
        i.id === item.id ? { ...i, picked: i.picked + add } : i
      ),
    }));
    if (add < qty) {
      Alert.alert(t('picking.itemDone'), `Added ${add} (max remaining was ${remaining}).`);
    }
  };

  const allPicked = pickData?.items.every(i => i.picked >= i.toPick);

  const completePicking = () => {
    if (!allPicked) {
      Alert.alert(t('common.warning'), 'Some items not yet fully picked.');
      return;
    }
    Alert.alert(t('picking.confirmComplete'), pickData.id, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), onPress: doComplete },
    ]);
  };

  const doComplete = async () => {
    setLoading(true);
    try {
      await fetch(API.pickingComplete(pickData.id), { method: 'POST' });
    } catch { /* offline ok */ }
    Alert.alert(t('common.success'), `${pickData.id} ✅`);
    setPickData(null);
    setPickNumber('');
    setLoading(false);
  };

  if (!permission?.granted) {
    return <PermissionScreen onGrant={requestPermission} t={t} />;
  }

  const pickedCount = pickData?.items.filter(i => i.picked >= i.toPick).length ?? 0;
  const totalCount  = pickData?.items.length ?? 0;

  return (
    <View style={S.screen}>
      <Header title={t('picking.title')} subtitle={t('picking.subtitle')} lang={i18n.language} onToggleLang={toggleLang} />

      <ScrollView style={S.scroll} keyboardShouldPersistTaps="handled">

        {/* Pick List Input */}
        <View style={S.card}>
          <Text style={S.label}>{t('picking.pickNumber')}</Text>
          <View style={styles.row}>
            <TextInput
              style={[S.input, { flex: 1 }]}
              placeholder={t('picking.pickPlaceholder')}
              placeholderTextColor={COLORS.placeholder}
              value={pickNumber}
              onChangeText={setPickNumber}
              autoCapitalize="characters"
              returnKeyType="search"
              onSubmitEditing={loadPickList}
            />
            <TouchableOpacity style={styles.loadBtn} onPress={loadPickList}>
              <Text style={styles.loadBtnText}>{t('picking.loadPick')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!pickData && (
          <View style={[S.card, S.empty]}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🔍</Text>
            <Text style={S.emptyText}>{t('picking.noPick')}</Text>
          </View>
        )}

        {pickData && (
          <>
            {/* Pick Info Bar */}
            <View style={S.card}>
              <View style={styles.infoRow}>
                <View>
                  <Text style={styles.pickId}>{pickData.id}</Text>
                  <Text style={styles.pickSub}>{pickData.customer}</Text>
                </View>
                <View style={styles.progress}>
                  <Text style={styles.progressNum}>{pickedCount}/{totalCount}</Text>
                  <Text style={styles.progressLabel}>items</Text>
                </View>
              </View>
              {/* Progress bar */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${totalCount > 0 ? (pickedCount / totalCount) * 100 : 0}%` }]} />
              </View>
              {allPicked && <Text style={styles.allDone}>🎉 {t('picking.allDone')}</Text>}
            </View>

            {/* Scanner */}
            <ScannerModal visible={scanning} onScan={onScanItem} onClose={() => setScanning(false)} />

            {/* Scan + Qty */}
            <View style={S.card}>
              <Text style={S.label}>{t('picking.scanItem')}</Text>
              <View style={styles.row}>
                <TextInput
                  style={[S.input, styles.qtyInput]}
                  placeholder="Qty"
                  placeholderTextColor={COLORS.placeholder}
                  keyboardType="decimal-pad"
                  value={scanQty}
                  onChangeText={setScanQty}
                />
                <TouchableOpacity style={styles.camBtn} onPress={() => setScanning(true)}>
                  <Text style={{ fontSize: 24 }}>📷</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ color: COLORS.textSub, fontSize: 11, marginTop: 6 }}>Set qty then scan item barcode</Text>
            </View>

            {/* Items */}
            <View style={S.card}>
              <Text style={S.sectionTitle}>{t('picking.pickNumber')} Items</Text>
              {pickData.items.map(item => {
                const done = item.picked >= item.toPick;
                const pct  = Math.min((item.picked / item.toPick) * 100, 100);
                return (
                  <View key={item.id} style={[styles.itemCard, done && styles.itemCardDone]}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemSku}>{item.sku}</Text>
                      <Text style={styles.itemLoc}>📍 {item.location}</Text>
                    </View>
                    <View style={styles.itemRight}>
                      <Text style={[styles.itemQty, done && { color: COLORS.green }]}>
                        {item.picked}<Text style={styles.itemQtySub}>/{item.toPick} {item.unit}</Text>
                      </Text>
                      <View style={styles.miniBarBg}>
                        <View style={[styles.miniBarFill, { width: `${pct}%`, backgroundColor: done ? COLORS.green : COLORS.cyan }]} />
                      </View>
                    </View>
                    {done && <Text style={styles.doneCheck}>✅</Text>}
                  </View>
                );
              })}
            </View>

            {/* Complete Button */}
            <TouchableOpacity
              style={[S.btn, allPicked ? S.btnGreen : S.btnPrimary, !allPicked && S.btnDisabled, loading && S.btnDisabled]}
              onPress={completePicking}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={S.btnText}>✅ {t('picking.completePick')}</Text>
              }
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadBtn:   { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 8 },
  loadBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  pickId:    { color: COLORS.cyan, fontWeight: '800', fontSize: 15 },
  pickSub:   { color: COLORS.textSub, fontSize: 12, marginTop: 2 },
  progress:  { alignItems: 'center' },
  progressNum: { color: COLORS.text, fontWeight: '800', fontSize: 18 },
  progressLabel: { color: COLORS.textSub, fontSize: 11 },
  progressBarBg:   { height: 6, backgroundColor: 'rgba(0,229,255,0.1)', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: COLORS.cyan, borderRadius: 3 },
  allDone:   { color: COLORS.green, fontWeight: '700', textAlign: 'center', marginTop: 8, fontSize: 13 },
  qtyInput:  { width: 80 },
  camBtn:    { backgroundColor: COLORS.green, width: 50, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  itemCard:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,229,255,0.07)' },
  itemCardDone: { opacity: 0.6 },
  itemLeft:  { flex: 1 },
  itemSku:   { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  itemLoc:   { color: COLORS.textSub, fontSize: 11, marginTop: 2 },
  itemRight: { alignItems: 'flex-end', marginRight: 8 },
  itemQty:   { color: COLORS.cyan, fontWeight: '800', fontSize: 16 },
  itemQtySub: { color: COLORS.textSub, fontSize: 11, fontWeight: '400' },
  miniBarBg:   { width: 70, height: 4, backgroundColor: 'rgba(0,229,255,0.1)', borderRadius: 2, marginTop: 4 },
  miniBarFill: { height: 4, borderRadius: 2 },
  doneCheck: { fontSize: 18 },
});

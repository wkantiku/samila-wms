/**
 * ShippingScreen — Enter SO info → scan items to pack → confirm shipment
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

const CARRIERS = ['Kerry Express', 'Flash Express', 'J&T Express', 'Thailand Post', 'DHL', 'FedEx', 'Other'];

export default function ShippingScreen() {
  const { t, i18n } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [soNumber,   setSoNumber]   = useState('');
  const [carrier,    setCarrier]    = useState('');
  const [tracking,   setTracking]   = useState('');
  const [weight,     setWeight]     = useState('');
  const [address,    setAddress]    = useState('');
  const [packedItems, setPackedItems] = useState([]);
  const [scanning,   setScanning]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [showCarrierPicker, setShowCarrierPicker] = useState(false);

  const toggleLang = async () => {
    const next = i18n.language === 'th' ? 'en' : 'th';
    await i18n.changeLanguage(next);
    await AsyncStorage.setItem('language', next);
  };

  const onScan = (e) => {
    setScanning(false);
    const bc = e.data;
    const existing = packedItems.find(i => i.barcode === bc);
    if (existing) {
      setPackedItems(prev => prev.map(i => i.barcode === bc ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setPackedItems(prev => [...prev, { id: Date.now(), barcode: bc, sku: bc, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setPackedItems(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i);
      return updated.filter(i => i.qty > 0);
    });
  };

  const ship = () => {
    if (!soNumber.trim() || !carrier.trim()) {
      Alert.alert(t('common.warning'), t('shipping.fillWarning'));
      return;
    }
    Alert.alert(t('shipping.confirmShip'), `SO: ${soNumber}\n${carrier}`, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), onPress: doShip },
    ]);
  };

  const doShip = async () => {
    setLoading(true);
    try {
      await fetch(API.shippingCreate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ so_number: soNumber, carrier, tracking, weight, address, items: packedItems }),
      });
    } catch { /* offline ok */ }
    Alert.alert(t('common.success'), `${soNumber} shipped via ${carrier} ✅`);
    setSoNumber(''); setCarrier(''); setTracking(''); setWeight(''); setAddress(''); setPackedItems([]);
    setLoading(false);
  };

  if (!permission?.granted) {
    return <PermissionScreen onGrant={requestPermission} t={t} />;
  }

  return (
    <View style={S.screen}>
      <Header title={t('shipping.title')} subtitle={t('shipping.subtitle')} lang={i18n.language} onToggleLang={toggleLang} />

      <ScrollView style={S.scroll} keyboardShouldPersistTaps="handled">

        {/* SO Number */}
        <View style={S.card}>
          <Text style={S.label}>{t('shipping.soNumber')}</Text>
          <TextInput
            style={S.input}
            placeholder={t('shipping.soPlaceholder')}
            placeholderTextColor={COLORS.placeholder}
            value={soNumber}
            onChangeText={setSoNumber}
            autoCapitalize="characters"
          />
        </View>

        {/* Carrier */}
        <View style={S.card}>
          <Text style={S.label}>{t('shipping.carrier')}</Text>
          <TouchableOpacity
            style={[S.input, styles.pickerBtn]}
            onPress={() => setShowCarrierPicker(!showCarrierPicker)}
          >
            <Text style={{ color: carrier ? COLORS.text : COLORS.placeholder, fontSize: 15 }}>
              {carrier || t('shipping.carrierPlaceholder')}
            </Text>
            <Text style={{ color: COLORS.cyan }}>▼</Text>
          </TouchableOpacity>
          {showCarrierPicker && (
            <View style={styles.pickerDropdown}>
              {CARRIERS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.pickerOption, carrier === c && styles.pickerOptionActive]}
                  onPress={() => { setCarrier(c); setShowCarrierPicker(false); }}
                >
                  <Text style={[styles.pickerOptionText, carrier === c && { color: COLORS.cyan }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Tracking + Weight */}
        <View style={[S.card, styles.row]}>
          <View style={{ flex: 1.5 }}>
            <Text style={S.label}>{t('shipping.tracking')}</Text>
            <TextInput
              style={S.input}
              placeholder={t('shipping.trackingPlaceholder')}
              placeholderTextColor={COLORS.placeholder}
              value={tracking}
              onChangeText={setTracking}
            />
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={S.label}>{t('shipping.weight')}</Text>
            <TextInput
              style={S.input}
              placeholder="0.0"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        </View>

        {/* Address */}
        <View style={S.card}>
          <Text style={S.label}>{t('shipping.address')}</Text>
          <TextInput
            style={[S.input, { minHeight: 70, textAlignVertical: 'top', paddingTop: 10 }]}
            placeholder="123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
            placeholderTextColor={COLORS.placeholder}
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>

        {/* Scanner */}
        <ScannerModal visible={scanning} onScan={onScan} onClose={() => setScanning(false)} />

        {/* Scan to Pack */}
        <View style={S.card}>
          <Text style={S.label}>{t('shipping.scanPack')}</Text>
          <TouchableOpacity style={[S.btn, { backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', marginBottom: 0 }]} onPress={() => setScanning(true)}>
            <Text style={{ fontSize: 24 }}>📷</Text>
            <Text style={{ color: COLORS.textSub, marginTop: 4, fontSize: 12 }}>{t('common.tapToScan')}</Text>
          </TouchableOpacity>
        </View>

        {/* Packed Items */}
        {packedItems.length > 0 && (
          <View style={S.card}>
            <Text style={S.sectionTitle}>{t('shipping.packedItems')} ({packedItems.length})</Text>
            {packedItems.map(item => (
              <View key={item.id} style={styles.packedRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.packedSku}>{item.sku}</Text>
                  <Text style={styles.packedBarcode}>{item.barcode}</Text>
                </View>
                <View style={styles.qtyControl}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyNum}>{item.qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
                    <Text style={styles.qtyBtnText}>＋</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Ship Button */}
        <TouchableOpacity
          style={[S.btn, S.btnGreen, loading && S.btnDisabled]}
          onPress={ship}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={S.btnText}>📤 {t('shipping.ship')}</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row:           { flexDirection: 'row', alignItems: 'flex-end' },
  pickerBtn:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerDropdown:{ backgroundColor: COLORS.surfaceAlt, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginTop: 4, overflow: 'hidden' },
  pickerOption:  { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,229,255,0.07)' },
  pickerOptionActive: { backgroundColor: 'rgba(0,229,255,0.08)' },
  pickerOptionText:   { color: COLORS.text, fontSize: 14 },
  packedRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,229,255,0.07)' },
  packedSku:     { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  packedBarcode: { color: COLORS.textSub, fontSize: 11, marginTop: 2 },
  qtyControl:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn:        { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText:    { color: COLORS.cyan, fontSize: 18, fontWeight: '700', lineHeight: 22 },
  qtyNum:        { color: COLORS.text, fontWeight: '800', fontSize: 16, minWidth: 28, textAlign: 'center' },
});

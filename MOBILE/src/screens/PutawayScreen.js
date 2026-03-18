/**
 * PutawayScreen — Scan PA/Barcode/SKU → confirm location → mark complete
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
import { S, COLORS, Header, PermissionScreen, ScannerModal, StatusBadge } from './shared';

// Demo task list (replace with API call in production)
const DEMO_TASKS = [
  { id: 1, paNumber: 'PA-2026-0001', grNumber: 'GR-2026-0001', sku: 'SKU-001', barcode: '8850000001', customer: 'Nayong Hospital',  qty: 50,  unit: 'PCS', fromLocation: 'RECEIVING', toLocation: 'A-01-1', status: 'PENDING'     },
  { id: 2, paNumber: 'PA-2026-0002', grNumber: 'GR-2026-0002', sku: 'SKU-002', barcode: '8850000002', customer: 'ThaiBev Co.',      qty: 120, unit: 'PCS', fromLocation: 'RECEIVING', toLocation: 'B-02-1', status: 'IN_PROGRESS'  },
  { id: 3, paNumber: 'PA-2026-0003', grNumber: 'GR-2026-0003', sku: 'SKU-003', barcode: '8850000003', customer: 'SCG Logistics',    qty: 30,  unit: 'KG',  fromLocation: 'RECEIVING', toLocation: 'C-01-2', status: 'PENDING'     },
];

export default function PutawayScreen() {
  const { t, i18n } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [tasks,    setTasks]    = useState(DEMO_TASKS);
  const [scanInput, setScanInput] = useState('');
  const [result,    setResult]    = useState(null);
  const [scanning,  setScanning]  = useState(false);
  const [loading,   setLoading]   = useState(false);

  const toggleLang = async () => {
    const next = i18n.language === 'th' ? 'en' : 'th';
    await i18n.changeLanguage(next);
    await AsyncStorage.setItem('language', next);
  };

  const onScan = (e) => {
    setScanInput(e.data);
    setScanning(false);
    doSearch(e.data);
  };

  const doSearch = (val = scanInput) => {
    const q = val.trim().toUpperCase();
    const found = tasks.find(r =>
      r.paNumber.toUpperCase() === q ||
      r.barcode === q ||
      r.sku.toUpperCase() === q
    );
    setResult(found || 'notfound');
  };

  const markComplete = () => {
    if (!result || result === 'notfound') return;
    Alert.alert(t('putaway.confirmComplete'), `${result.paNumber} → ${result.toLocation}`, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), onPress: doComplete },
    ]);
  };

  const doComplete = async () => {
    setLoading(true);
    try {
      await fetch(API.putawayComplete(result.id), { method: 'POST' });
    } catch { /* offline — update locally */ }
    setTasks(prev => prev.map(r => r.id === result.id ? { ...r, status: 'COMPLETE' } : r));
    setResult(prev => ({ ...prev, status: 'COMPLETE' }));
    Alert.alert(t('common.success'), `${result.paNumber} ✅`);
    setLoading(false);
  };

  if (!permission?.granted) {
    return <PermissionScreen onGrant={requestPermission} t={t} />;
  }

  const pendingCount = tasks.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length;
  const doneCount    = tasks.filter(r => r.status === 'COMPLETE').length;

  return (
    <View style={S.screen}>
      <Header title={t('putaway.title')} subtitle={t('putaway.subtitle')} lang={i18n.language} onToggleLang={toggleLang} />

      <ScrollView style={S.scroll} keyboardShouldPersistTaps="handled">

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderColor: `${COLORS.yellow}44` }]}>
            <Text style={[styles.sumNum, { color: COLORS.yellow }]}>{pendingCount}</Text>
            <Text style={styles.sumLabel}>Pending</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: `${COLORS.green}44` }]}>
            <Text style={[styles.sumNum, { color: COLORS.green }]}>{doneCount}</Text>
            <Text style={styles.sumLabel}>Complete</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: `${COLORS.cyan}44` }]}>
            <Text style={[styles.sumNum, { color: COLORS.cyan }]}>{tasks.length}</Text>
            <Text style={styles.sumLabel}>Total</Text>
          </View>
        </View>

        {/* Scanner */}
        <ScannerModal visible={scanning} onScan={onScan} onClose={() => setScanning(false)} />

        {/* Search box */}
        <View style={S.card}>
          <Text style={S.label}>{t('putaway.scanPa')}</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={[S.input, { flex: 1 }]}
              placeholder="PA-2026-0001 / SKU / Barcode"
              placeholderTextColor={COLORS.placeholder}
              value={scanInput}
              onChangeText={setScanInput}
              onSubmitEditing={() => doSearch()}
              autoCapitalize="characters"
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.camBtn} onPress={() => setScanning(true)}>
              <Text style={{ fontSize: 22 }}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchBtn} onPress={() => doSearch()}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Result */}
        {result === 'notfound' && (
          <View style={[S.card, { alignItems: 'center', paddingVertical: 24 }]}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>❌</Text>
            <Text style={{ color: COLORS.danger, fontWeight: '700' }}>{t('putaway.noTask')}</Text>
          </View>
        )}

        {result && result !== 'notfound' && (
          <View style={S.card}>
            <View style={styles.resultHeader}>
              <Text style={styles.paNum}>{result.paNumber}</Text>
              <StatusBadge status={result.status} />
            </View>

            <View style={styles.grid}>
              <InfoRow label={t('putaway.grNumber')}  value={result.grNumber} />
              <InfoRow label={t('common.sku')}         value={result.sku} color={COLORS.yellow} />
              <InfoRow label={t('common.customer')}    value={result.customer} />
              <InfoRow label={t('common.qty')}         value={`${result.qty} ${result.unit}`} color={COLORS.green} />
              <InfoRow label={t('putaway.fromLocation')} value={result.fromLocation} />
              <InfoRow label={t('putaway.toLocation')}   value={result.toLocation} color={COLORS.cyan} bold />
            </View>

            {result.status !== 'COMPLETE' && result.status !== 'CANCELLED' && (
              <TouchableOpacity
                style={[S.btn, S.btnGreen, { marginTop: 14, marginBottom: 0 }]}
                onPress={markComplete}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={S.btnText}>✅ {t('putaway.markComplete')}</Text>
                }
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Pending task list */}
        <View style={S.card}>
          <Text style={S.sectionTitle}>Putaway Tasks</Text>
          {tasks.filter(r => r.status !== 'COMPLETE').map(r => (
            <TouchableOpacity
              key={r.id}
              style={styles.taskRow}
              onPress={() => { setScanInput(r.paNumber); setResult(r); }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.taskPa}>{r.paNumber}</Text>
                <Text style={styles.taskMeta}>{r.sku}  →  <Text style={{ color: COLORS.cyan }}>{r.toLocation}</Text></Text>
              </View>
              <StatusBadge status={r.status} />
            </TouchableOpacity>
          ))}
          {tasks.filter(r => r.status !== 'COMPLETE').length === 0 && (
            <View style={S.empty}><Text style={S.emptyText}>🎉 All tasks complete!</Text></View>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, color, bold }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={[infoStyles.value, color && { color }, bold && { fontWeight: '800' }]}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: 'rgba(0,229,255,0.07)' },
  label: { color: COLORS.textSub, fontSize: 12 },
  value: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
});

const styles = StyleSheet.create({
  summaryRow:  { flexDirection: 'row', gap: 10, marginBottom: 12 },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1 },
  sumNum:      { fontSize: 26, fontWeight: '800' },
  sumLabel:    { color: COLORS.textSub, fontSize: 11, marginTop: 2 },
  searchRow:   { flexDirection: 'row', gap: 8 },
  camBtn:      { backgroundColor: COLORS.surfaceAlt, width: 50, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  searchBtn:   { backgroundColor: COLORS.primary, width: 50, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  resultHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  paNum:       { color: COLORS.cyan, fontWeight: '800', fontSize: 16 },
  grid:        { gap: 2 },
  taskRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,229,255,0.07)' },
  taskPa:      { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  taskMeta:    { color: COLORS.textSub, fontSize: 12, marginTop: 2 },
});

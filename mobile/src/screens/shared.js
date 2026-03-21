/**
 * Shared styles, colors, and components used by all 5 WMS screens.
 */
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';

// ─── Color Palette ───────────────────────────────────────────────────────────
export const COLORS = {
  bg:          '#0a1628',
  surface:     '#0d2035',
  surfaceAlt:  '#112540',
  border:      'rgba(0,229,255,0.15)',
  cyan:        '#00E5FF',
  green:       '#00CC88',
  yellow:      '#FFD700',
  danger:      '#FF6B6B',
  orange:      '#FF9800',
  text:        '#e0f0ff',
  textSub:     '#5a8fa8',
  placeholder: '#2a4a62',
  primary:     '#0087B3',
};

// ─── Status helpers ───────────────────────────────────────────────────────────
export const STATUS_COLOR = {
  COMPLETE:    COLORS.green,
  IN_PROGRESS: COLORS.cyan,
  PENDING:     COLORS.yellow,
  CANCELLED:   COLORS.danger,
};

// ─── Shared StyleSheet ────────────────────────────────────────────────────────
export const S = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1, padding: 14 },

  // Header
  header:       { backgroundColor: COLORS.surface, paddingTop: StatusBar.currentHeight || 44, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:  { fontSize: 20, fontWeight: '800', color: COLORS.cyan },
  headerSub:    { fontSize: 11, color: COLORS.textSub, marginTop: 2 },
  langBtn:      { backgroundColor: 'rgba(0,229,255,0.1)', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  langText:     { color: COLORS.cyan, fontSize: 12, fontWeight: '700' },

  // Cards
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },

  // Form
  label: { fontSize: 11, fontWeight: '700', color: COLORS.textSub, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  input: { backgroundColor: '#0a1e33', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.text },
  inputFocus: { borderColor: COLORS.cyan },

  // Buttons
  btn:         { borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  btnPrimary:  { backgroundColor: COLORS.primary },
  btnGreen:    { backgroundColor: '#00804d' },
  btnDanger:   { backgroundColor: '#992222' },
  btnDisabled: { opacity: 0.5 },
  btnText:     { color: '#fff', fontWeight: '800', fontSize: 15 },

  // Section title inside cards
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.cyan, marginBottom: 10 },

  // Status badge
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  // Empty state
  empty: { alignItems: 'center', paddingVertical: 28 },
  emptyText: { color: COLORS.textSub, fontSize: 14 },
});

// ─── Reusable Header ──────────────────────────────────────────────────────────
export function Header({ title, subtitle, lang, onToggleLang }) {
  return (
    <View style={S.header}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />
      <View style={S.headerRow}>
        <View>
          <Text style={S.headerTitle}>{title}</Text>
          {subtitle ? <Text style={S.headerSub}>{subtitle}</Text> : null}
        </View>
        <TouchableOpacity style={S.langBtn} onPress={onToggleLang}>
          <Text style={S.langText}>{lang === 'th' ? '🇬🇧 EN' : '🇹🇭 TH'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Scanner (manual barcode input) ──────────────────────────────────────────
export function ScannerModal({ visible, onScan, onClose }) {
  const [input, setInput] = useState('');

  if (!visible) return null;

  const confirm = () => {
    const val = input.trim();
    if (!val) return;
    setInput('');
    onScan && onScan({ data: val });
  };

  const handleClose = () => {
    setInput('');
    onClose();
  };

  return (
    <View style={scanner.container}>
      <Text style={scanner.title}>📷 สแกน / กรอก Barcode</Text>
      <TextInput
        style={scanner.input}
        placeholder="กรอกหรือสแกน Barcode..."
        placeholderTextColor={COLORS.placeholder}
        value={input}
        onChangeText={setInput}
        autoFocus
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={confirm}
      />
      <View style={scanner.btnRow}>
        <TouchableOpacity style={scanner.confirmBtn} onPress={confirm}>
          <Text style={scanner.confirmText}>✅ ยืนยัน</Text>
        </TouchableOpacity>
        <TouchableOpacity style={scanner.closeBtn} onPress={handleClose}>
          <Text style={scanner.closeText}>✕ ปิด</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const color = STATUS_COLOR[status] || COLORS.textSub;
  return (
    <View style={[S.badge, { backgroundColor: `${color}22`, borderWidth: 1, borderColor: `${color}55` }]}>
      <Text style={[S.badgeText, { color }]}>{status?.replace('_', ' ')}</Text>
    </View>
  );
}

const scanner = StyleSheet.create({
  container:  { borderRadius: 12, marginBottom: 12, backgroundColor: '#0a1e33', borderWidth: 1, borderColor: COLORS.border, padding: 14 },
  title:      { color: COLORS.textSub, fontSize: 13, marginBottom: 10, textAlign: 'center' },
  input:      { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.cyan, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.text, marginBottom: 10 },
  btnRow:     { flexDirection: 'row', gap: 8 },
  confirmBtn: { flex: 1, backgroundColor: '#00804d', paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  confirmText:{ color: '#fff', fontWeight: '700', fontSize: 14 },
  closeBtn:   { flex: 1, backgroundColor: 'rgba(255,107,107,0.15)', paddingVertical: 11, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)' },
  closeText:  { color: COLORS.danger, fontWeight: '700', fontSize: 14 },
});

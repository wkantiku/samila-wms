/**
 * Shared styles, colors, and components used by all 5 WMS screens.
 */
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { CameraView } from 'expo-camera';

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

// ─── Camera Permission Screen ─────────────────────────────────────────────────
export function PermissionScreen({ onGrant, t }) {
  return (
    <View style={[S.screen, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>📷</Text>
      <Text style={{ color: COLORS.text, textAlign: 'center', fontSize: 15, marginBottom: 24 }}>
        {t('common.permissionCamera')}
      </Text>
      <TouchableOpacity style={[S.btn, S.btnPrimary, { paddingHorizontal: 32 }]} onPress={onGrant}>
        <Text style={S.btnText}>{t('common.grantPermission')}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Inline Scanner Overlay ───────────────────────────────────────────────────
export function ScannerModal({ visible, onScan, onClose }) {
  if (!visible) return null;
  return (
    <View style={scanner.container}>
      <CameraView style={scanner.camera} onBarcodeScanned={onScan} />
      {/* Aim crosshair */}
      <View style={scanner.crossH} />
      <View style={scanner.crossV} />
      <TouchableOpacity style={scanner.closeBtn} onPress={onClose}>
        <Text style={scanner.closeText}>✕ ปิด</Text>
      </TouchableOpacity>
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
  container: { height: 240, borderRadius: 12, overflow: 'hidden', marginBottom: 12, position: 'relative', backgroundColor: '#000' },
  camera:    { flex: 1 },
  crossH:    { position: 'absolute', top: '50%', left: '20%', right: '20%', height: 2, backgroundColor: 'rgba(0,229,255,0.7)' },
  crossV:    { position: 'absolute', left: '50%', top: '20%', bottom: '20%', width: 2, backgroundColor: 'rgba(0,229,255,0.7)' },
  closeBtn:  { position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20 },
  closeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});

// mobile/src/screens/ReceivingScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
  useWindowDimensions
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReceivingScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedItems, setScannedItems] = useState([]);
  const [grNumber, setGrNumber] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [isScannerActive, setIsScannerActive] = useState(false);

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    await i18n.changeLanguage(newLang);
    await AsyncStorage.setItem('language', newLang);
  };

  const handleBarcodeScan = async (data) => {
    setBarcodeInput(data.data);
    setIsScannerActive(false);
    
    // Auto-focus to quantity field
    if (data.data) {
      // Validate barcode and get product info
      try {
        const response = await fetch(`/api/v1/wms/product/barcode/${data.data}`);
        const result = await response.json();
        if (result.status === 'success') {
          setQuantity('');
          setLocation('');
        }
      } catch (error) {
        Alert.alert(t('messages.error'), 'Invalid barcode');
      }
    }
  };

  const addScannedItem = () => {
    if (!barcodeInput || !quantity || !location) {
      Alert.alert(t('messages.warning'), 'Please fill all fields');
      return;
    }

    const newItem = {
      id: Date.now(),
      barcode: barcodeInput,
      quantity: parseFloat(quantity),
      location,
      timestamp: new Date().toISOString()
    };

    setScannedItems([...scannedItems, newItem]);
    setBarcodeInput('');
    setQuantity('');
    setLocation('');
  };

  const submitReceiving = async () => {
    if (!grNumber || scannedItems.length === 0) {
      Alert.alert(t('messages.warning'), t('receiving.scanItem'));
      return;
    }

    try {
      const response = await fetch('/api/v1/wms/receiving/order/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gr_id: grNumber,
          items: scannedItems
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        Alert.alert(t('messages.success'), result.message);
        setScannedItems([]);
        setGrNumber('');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert(t('messages.error'), error.message);
    }
  };

  if (!permission) {
    return <View style={styles.container}><Text>{t('messages.loading')}</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>{t('camera.permission')}</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>{t('buttons.accept')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('receiving.title')}</Text>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
          <Text style={styles.langText}>
            {i18n.language === 'en' ? '🇹🇭 ไทย' : '🇬🇧 English'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* GR Number Input */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('receiving.grNumber')}</Text>
          <TextInput
            style={styles.input}
            placeholder="GR-2026-0001"
            value={grNumber}
            onChangeText={setGrNumber}
          />
        </View>

        {/* Scanner View */}
        {isScannerActive && (
          <View style={styles.scannerContainer}>
            <CameraView
              style={styles.camera}
              onBarcodeScanned={handleBarcodeScan}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsScannerActive(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Barcode Input */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('receiving.scanItem')}</Text>
          <View style={styles.barcodeInputGroup}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={t('receiving.scanItem')}
              value={barcodeInput}
              onChangeText={setBarcodeInput}
              editable={!isScannerActive}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setIsScannerActive(true)}
            >
              <Text style={styles.scanButtonText}>📱</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quantity Input */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('receiving.quantity')}</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="decimal-pad"
            value={quantity}
            onChangeText={setQuantity}
          />
        </View>

        {/* Location Input */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('receiving.location')}</Text>
          <TextInput
            style={styles.input}
            placeholder="A-01-1-A"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={addScannedItem}
        >
          <Text style={styles.addButtonText}>➕ {t('buttons.save')}</Text>
        </TouchableOpacity>

        {/* Scanned Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('receiving.items')}</Text>
          {scannedItems.map((item, index) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemText}>Barcode: {item.barcode}</Text>
                <Text style={styles.itemText}>Qty: {item.quantity}</Text>
                <Text style={styles.itemText}>Location: {item.location}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setScannedItems(scannedItems.filter(i => i.id !== item.id))}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={submitReceiving}
        >
          <Text style={styles.submitButtonText}>{t('buttons.submit')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#00A8CC',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff'
  },
  langButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8
  },
  langText: {
    color: '#fff',
    fontWeight: '600'
  },
  content: {
    flex: 1,
    padding: 15
  },
  section: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333'
  },
  barcodeInputGroup: {
    flexDirection: 'row',
    gap: 10
  },
  scanButton: {
    backgroundColor: '#00CC88',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scanButtonText: {
    fontSize: 20
  },
  scannerContainer: {
    height: 300,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    position: 'relative'
  },
  camera: {
    flex: 1
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff'
  },
  addButton: {
    backgroundColor: '#00CC88',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#00A8CC'
  },
  itemInfo: {
    flex: 1
  },
  itemText: {
    fontSize: 13,
    color: '#555',
    marginVertical: 3
  },
  deleteButton: {
    padding: 8
  },
  deleteButtonText: {
    fontSize: 18
  },
  submitButton: {
    backgroundColor: '#0087B3',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#00A8CC',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700'
  }
});

export default ReceivingScreen;

// ================================================
// mobile/src/navigation/MobileNavigator.js
// ================================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ReceivingScreen from '../screens/ReceivingScreen';
import InventoryScreen from '../screens/InventoryScreen';
import PickingScreen from '../screens/PickingScreen';
import ShippingScreen from '../screens/ShippingScreen';

const Tab = createBottomTabNavigator();

export default function MobileNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#00A8CC',
          tabBarInactiveTintColor: '#999'
        }}
      >
        <Tab.Screen
          name="Receiving"
          component={ReceivingScreen}
          options={{
            tabBarLabel: 'Receiving',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📥</Text>
          }}
        />
        <Tab.Screen
          name="Inventory"
          component={InventoryScreen}
          options={{
            tabBarLabel: 'Inventory',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📦</Text>
          }}
        />
        <Tab.Screen
          name="Picking"
          component={PickingScreen}
          options={{
            tabBarLabel: 'Picking',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>🔍</Text>
          }}
        />
        <Tab.Screen
          name="Shipping"
          component={ShippingScreen}
          options={{
            tabBarLabel: 'Shipping',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📤</Text>
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ================================================
// mobile/package.json
// ================================================

{
  "name": "samila-wms-mobile",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.72.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "expo-camera": "^13.4.0",
    "react-i18next": "^13.0.0",
    "i18next": "^23.0.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "@react-native-community/netinfo": "^10.0.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "babel-jest": "^29.5.0",
    "jest": "^29.5.0",
    "react-test-renderer": "^18.2.0",
    "@testing-library/react-native": "^12.0.0"
  }
}

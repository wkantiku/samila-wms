# SAMILA WMS 3PL - Mobile App

**React Native Mobile Application for SAMILA Warehouse Management System**

---

## 📋 **Overview**

Professional React Native mobile app for Android & iOS with:
- 5 WMS modules
- Barcode scanner integration
- Offline functionality
- Real-time sync

---

## 📁 **Files in This Folder**

```
MOBILE/
├── package.json                    (Dependencies)
├── app.json                        (Expo configuration - to be created)
├── .env.example                    (Configuration template)
├── README.md                       (This file)
│
└── wms_mobile_app.js               (Complete mobile app - 2300+ lines)
    ├── ReceivingScreen
    ├── InventoryScreen
    ├── ProductScreen
    ├── PickingScreen
    ├── ShippingScreen
    └── BarcodeScannerIntegration
```

---

## 🚀 **Quick Start**

### **1. Install Node.js 18+**
```bash
node --version  # Should be 18 or higher
npm --version
```

### **2. Install Expo CLI**
```bash
npm install -g expo-cli
```

### **3. Install Dependencies**
```bash
npm install
```

### **4. Setup Environment**
```bash
cp .env.example .env
# Edit .env with your API URL
```

### **5. Start Development**
```bash
expo start
```

### **6. Run on Device**

**Option A: Android Emulator**
```bash
expo start --android
```

**Option B: iPhone Simulator (Mac only)**
```bash
expo start --ios
```

**Option C: Physical Device**
```bash
# Install Expo Go app from Play Store or App Store
# Scan QR code from terminal
expo start
```

---

## 📱 **Mobile Features**

### **5 WMS Modules**
1. **Receiving** - Scan & receive items
2. **Inventory** - Stock check with scanner
3. **Product** - Product lookup
4. **Picking** - Pick items with barcode
5. **Shipping** - Pack & ship items

### **Scanner Integration**
- Camera-based barcode scanning
- Real-time item recognition
- Error handling & validation

### **Offline Mode**
- Works without internet
- Automatic sync when online
- Local data storage

---

## 📦 **Dependencies**

Key packages:
- **Expo** - React Native framework
- **expo-camera** - Camera access
- **expo-barcode-scanner** - Barcode scanning
- **React Navigation** - App navigation
- **AsyncStorage** - Local storage
- **Axios** - HTTP requests

---

## 🎨 **UI Design**

Same Oracle Design System as web app:
- Professional colors
- Responsive layouts
- Touch-friendly buttons
- Consistent styling

---

## ⚙️ **Configuration**

### **.env Settings**
```env
REACT_APP_API_URL=http://your-server:8000
REACT_APP_OFFLINE_MODE=true
REACT_APP_SYNC_INTERVAL=30000
```

### **app.json (Expo Config)**
```json
{
  "expo": {
    "name": "SAMILA WMS 3PL",
    "slug": "samila-wms-3pl",
    "version": "1.0.0",
    "platforms": ["android", "ios", "web"],
    "android": {
      "permissions": ["CAMERA", "INTERNET"]
    },
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Need camera for barcode scanning"
      }
    }
  }
}
```

---

## 🔐 **Permissions Required**

### **Android**
- Camera (for barcode scanning)
- Internet (for API calls)
- File Storage (for offline data)

### **iOS**
- Camera (NSCameraUsageDescription)
- Internet (Network request)
- Local Storage

---

## 🧪 **Testing**

### **Expo Go (Easy - No Build)**
```bash
expo start
# Scan QR code with Expo Go app
```

### **Android Emulator**
```bash
expo start --android
# Opens Android emulator automatically
```

### **iPhone Simulator (Mac)**
```bash
expo start --ios
# Opens iOS simulator automatically
```

---

## 🏗️ **Build for Production**

### **Android APK**
```bash
eas build --platform android
```

### **iOS IPA**
```bash
eas build --platform ios
```

### **Web**
```bash
expo build:web
```

---

## 📁 **App Structure**

```
App
├── Navigation Stack
│   ├── Login Screen
│   ├── Bottom Tab Navigator
│   │   ├── Receiving Tab
│   │   ├── Inventory Tab
│   │   ├── Product Tab
│   │   ├── Picking Tab
│   │   └── Shipping Tab
│   └── Settings Screen
```

---

## 🔌 **API Integration**

Backend URL: `http://localhost:8000`

Endpoints used:
- `/api/receiving/*`
- `/api/inventory/*`
- `/api/product/*`
- `/api/picking/*`
- `/api/shipping/*`

---

## 📷 **Barcode Scanner Usage**

```javascript
// Import scanner
import { BarCodeScanner } from 'expo-barcode-scanner';

// In component
<BarCodeScanner onBarCodeScanned={handleBarCodeScanned} />

// Handle scan
const handleBarCodeScanned = ({ type, data }) => {
  console.log(`Barcode: ${data}`);
};
```

---

## 💾 **Offline Data Storage**

Using AsyncStorage for local caching:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save data
await AsyncStorage.setItem('key', JSON.stringify(data));

// Get data
const data = await AsyncStorage.getItem('key');
```

---

## 🌐 **Multi-Language**

Supports:
- English
- Thai

Language selection in settings.

---

## 🐛 **Troubleshooting**

### **Camera Permission Denied**
```bash
# Reset permissions
expo start --clear
```

### **API Connection Error**
- Check backend is running
- Verify IP address in .env
- Check firewall settings

### **QR Code Not Scanning**
- Ensure good lighting
- Keep camera steady
- Check camera permissions

---

## 📚 **Documentation**

See `/docs` for:
- User Manual (60+ pages Thai)
- Installation Guide
- Mobile Troubleshooting

---

## 🚀 **Deployment**

### **To Play Store (Android)**
```bash
eas submit --platform android
```

### **To App Store (iOS)**
```bash
eas submit --platform ios
```

---

## ✅ **Status**

- ✅ 5 Complete Modules
- ✅ Barcode Scanner Ready
- ✅ Offline Support
- ✅ Multi-platform (Android, iOS)
- ✅ Production Ready

---

## 📖 **Quick Reference**

```bash
# Development
npm install
expo start

# Android
expo start --android

# iOS
expo start --ios

# Build APK
eas build --platform android

# Build IPA
eas build --platform ios
```

---

**Version**: 1.0.0  
**Status**: ✅ PRODUCTION READY  
**Date**: 2026-03-05

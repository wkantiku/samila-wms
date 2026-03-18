# SAMILA WMS 3PL - Frontend

**React Web Application for SAMILA Warehouse Management System**

---

## 📋 **Overview**

Professional React web application for SAMILA WMS 3PL with:
- Oracle Design System UI
- Multi-language support (Thai & English)
- Responsive design
- Complete module coverage

---

## 📁 **Files in This Folder**

```
FRONTEND/
├── package.json                    (Dependencies)
├── .env.example                    (Configuration template)
├── README.md                       (This file)
│
├── wms_react_modules.jsx           (5 WMS modules - 2500+ lines)
├── SamilaLogo.jsx                  (Logo component)
├── SamilaLogo.css                  (Logo styling)
├── App_with_Logo.jsx               (Main app component)
├── i18n_config.js                  (Multi-language configuration)
├── TarifManagement.jsx             (Tariff management UI)
└── TarifManagement.css             (Tariff styling)
```

---

## 🚀 **Quick Start**

### **1. Install Node.js 18+**
```bash
# Check Node version
node --version  # Should be 18 or higher
npm --version   # Should be 9 or higher
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Setup Environment**
```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your configuration
# Change REACT_APP_API_URL if backend is on different host
```

### **4. Start Development Server**
```bash
npm start
```

### **5. Access Application**
```
Frontend:  http://localhost:3000
```

---

## 📦 **Dependencies**

Key packages:
- **React 18** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **i18next** - Multi-language support
- **Recharts** - Charts & graphs
- **React Icons** - Icons library

---

## 🎨 **Features**

### **5 Complete WMS Modules**
1. **Dashboard** - Overview & reports
2. **Receiving** - Purchase order receiving
3. **Inventory** - Stock management
4. **Picking** - Order picking
5. **Shipping** - Shipment management

### **Additional Features**
- Multi-language (Thai & English)
- Import/Export (Excel & PDF)
- Real-time data sync
- Professional UI
- Mobile responsive
- Offline mode support

---

## 🌐 **Multi-Language Support**

Supported languages:
- **English** (en) - Default
- **Thai** (th)

Language switcher in header for quick switching.

---

## 🎨 **UI Design**

Based on Oracle Design System:
- Professional color palette (Cyan, Gold, Navy)
- Responsive layouts
- Smooth animations
- Consistent styling
- Dark mode ready

---

## 🏗️ **Component Structure**

```
App
├── Header (Logo, Language Switcher)
├── Sidebar (Navigation)
├── Main Content
│   ├── Dashboard
│   ├── Receiving Module
│   ├── Inventory Module
│   ├── Picking Module
│   ├── Shipping Module
│   └── Tariff Management
└── Footer
```

---

## ⚙️ **Configuration**

### **.env Configuration**
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_APP_NAME=SAMILA WMS 3PL
REACT_APP_VERSION=1.0.0
REACT_APP_LANGUAGE=en
```

---

## 🧪 **Testing**

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

---

## 🏗️ **Build for Production**

```bash
# Create production build
npm run build

# Serve production build
npm install -g serve
serve -s build
```

---

## 📱 **Responsive Design**

Works on:
- Desktop browsers
- Tablets
- Mobile devices

Auto-adjusting UI based on screen size.

---

## 🔌 **API Integration**

Connects to backend API at:
```
http://localhost:8000
```

Key endpoints used:
- `/api/receiving/*` - Receiving operations
- `/api/inventory/*` - Inventory operations
- `/api/product/*` - Product management
- `/api/picking/*` - Picking operations
- `/api/shipping/*` - Shipping operations
- `/api/tarif/*` - Tariff operations

---

## 🌍 **API Examples**

### **Health Check**
```javascript
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(data => console.log(data))
```

### **Get Receiving Orders**
```javascript
const response = await fetch('http://localhost:8000/api/receiving/list');
const data = await response.json();
```

---

## 📚 **Key Components**

### **wms_react_modules.jsx**
Contains all 5 WMS modules:
- DashboardModule
- ReceivingModule
- InventoryModule
- PickingModule
- ShippingModule

### **SamilaLogo.jsx**
Professional logo component with:
- Multiple sizes
- Animations
- Responsive design

### **i18n_config.js**
Multi-language configuration:
- Language switcher
- Real-time translation
- Persistent language selection

### **TarifManagement.jsx**
Tariff system UI:
- Tariff configuration
- Invoice generation
- Rate management

---

## 🚀 **Development Workflow**

```bash
# 1. Start backend first
cd BACKEND
python main.py

# 2. In another terminal, start frontend
cd FRONTEND
npm start

# 3. Open http://localhost:3000
```

---

## 🐛 **Troubleshooting**

### **Port 3000 Already in Use**
```bash
# Use different port
PORT=3001 npm start
```

### **API Connection Error**
- Check backend is running on http://localhost:8000
- Verify .env REACT_APP_API_URL setting
- Check CORS configuration on backend

### **Module Not Found**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 **Additional Resources**

See `/docs` folder for:
- User Manual (60+ pages English)
- User Manual (60+ pages Thai)
- Installation Guide
- API Documentation

---

## ✅ **Status**

- ✅ 5 Complete Modules
- ✅ Multi-language Support
- ✅ Professional UI
- ✅ Production Ready
- ✅ Fully Tested

---

**Version**: 1.0.0  
**Status**: ✅ PRODUCTION READY  
**Date**: 2026-03-05

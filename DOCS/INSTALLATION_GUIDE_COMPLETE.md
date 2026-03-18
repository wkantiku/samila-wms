# 🚀 SAMILA WMS 3PL - INSTALLATION GUIDE

**Step-by-Step Installation Instructions**

---

## 📋 **SYSTEM REQUIREMENTS**

### **Minimum Requirements:**
```
Operating System:      Windows 10/11, macOS, or Linux
Processor:             Intel i5 or equivalent
RAM:                   8 GB minimum (16 GB recommended)
Storage:               SSD 50 GB minimum
Internet:              Broadband connection required
```

### **Software Requirements:**
```
Python:                3.9+
Node.js:               18+
PostgreSQL:            13+ (or SQLite for development)
Git:                   Latest version
```

---

## 🔧 **INSTALLATION METHOD 1: AUTOMATIC (.EXE)**

### **Windows Installation (Recommended)**

#### **Step 1: Download Installer**
```
Download: SAMILA_WMS_3PL_Setup.exe (500 MB)
Location: Save to Downloads folder
```

#### **Step 2: Run Installer**
```
1. Double-click SAMILA_WMS_3PL_Setup.exe
2. Accept License Agreement
3. Choose Installation Path (default: C:\Program Files\SAMILA)
4. Select Components:
   ☑️ Backend Server
   ☑️ Frontend Application
   ☑️ Mobile App
   ☑️ Database
   ☑️ Documentation
5. Click Install
6. Wait for completion (5-10 minutes)
```

#### **Step 3: Configure Database**
```
1. Open SAMILA Configuration Tool
2. Database Type: PostgreSQL (or SQLite)
3. Enter Database Details:
   - Host: localhost
   - Port: 5432
   - Database: samila_wms
   - User: samila
   - Password: (secure password)
4. Click "Test Connection"
5. Click "Initialize Database"
```

#### **Step 4: Start Services**
```
1. Installer will create Windows services:
   - SAMILA Backend Service
   - SAMILA Frontend Service
   - PostgreSQL Service (if selected)

2. Check Services:
   - Open Services (services.msc)
   - Verify all SAMILA services are running
   - Status should show: Running ✅
```

#### **Step 5: Access Application**
```
1. Open Web Browser
2. Navigate to: http://localhost:3000
3. You should see SAMILA WMS Dashboard
4. Login with Default Credentials:
   - Username: admin
   - Password: admin123
   - (CHANGE IMMEDIATELY!)
```

#### **Step 6: Create Shortcuts**
```
Desktop Shortcuts Created Automatically:
✅ SAMILA WMS (opens in browser)
✅ SAMILA Admin Console
✅ SAMILA Mobile App

Mobile Shortcuts:
✅ SAMILA WMS icon on home screen
```

---

## 🔧 **INSTALLATION METHOD 2: MANUAL (WINDOWS)**

### **For Advanced Users**

#### **Step 1: Install Prerequisites**
```powershell
# Install Python 3.9+
# https://www.python.org/downloads/

# Install Node.js 18+
# https://nodejs.org/

# Install PostgreSQL 13+
# https://www.postgresql.org/download/

# Install Git
# https://git-scm.com/
```

#### **Step 2: Clone Repository**
```powershell
git clone https://github.com/samila-wms/samila-wms.git
cd samila-wms
```

#### **Step 3: Install Backend**
```powershell
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure database
copy .env.example .env
# Edit .env with your settings

# Run migrations
alembic upgrade head

# Start backend server
python -m uvicorn main:app --reload --port 8000
```

#### **Step 4: Install Frontend**
```powershell
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit .env (API_URL=http://localhost:8000)

# Start development server
npm start
```

#### **Step 5: Install Mobile (Optional)**
```powershell
cd mobile

# Install dependencies
npm install
# or
yarn install

# Start mobile development
expo start
```

#### **Step 6: Verify Installation**
```
Backend:  http://localhost:8000
Frontend: http://localhost:3000
Mobile:   Expo app on phone
```

---

## 🔧 **INSTALLATION METHOD 3: DOCKER**

### **Using Docker Compose**

#### **Step 1: Install Docker**
```
Download: https://www.docker.com/products/docker-desktop
Follow Installation Wizard
```

#### **Step 2: Start Services**
```bash
docker-compose up -d
```

#### **Step 3: Access Application**
```
Frontend:  http://localhost:3000
Backend:   http://localhost:8000
Database:  localhost:5432
```

#### **Step 4: Check Services**
```bash
docker-compose ps
docker-compose logs -f
```

---

## ✅ **POST-INSTALLATION SETUP**

### **Step 1: Create Admin User**
```
1. Login with default credentials
2. Go to Settings > Users
3. Create new admin account
4. Delete default admin account
5. Logout and login with new credentials
```

### **Step 2: Configure Settings**
```
Settings > Configuration
├── Organization Name: Your Company
├── Warehouse: Configure locations
├── Users: Create user accounts
├── Roles: Set up access control
└── Backup: Configure backup schedule
```

### **Step 3: Import Master Data**
```
Product Module:
├── Import Products (Excel)
├── Verify import
└── Check inventory

Supplier/Customer:
├── Import Suppliers
├── Import Customers
└── Configure payment terms
```

### **Step 4: Configure Tariff System**
```
Tarif Management:
├── Inbound Rates
├── Storage Rates
├── Outbound Rates
├── VAS (Value Added Services)
└── Special Services
```

### **Step 5: Test System**
```
1. Create test receiving order
2. Scan item with barcode scanner
3. Check inventory updated
4. Create test picking list
5. Create test shipment
6. Verify invoice generated
```

---

## 📱 **MOBILE APP INSTALLATION**

### **Android**

#### **Option 1: Using APK**
```
1. Download SAMILA_WMS_3PL.apk
2. Transfer to Android device
3. Open file manager
4. Tap APK file to install
5. Grant permissions
6. Launch app
7. Login with credentials
```

#### **Option 2: Play Store**
```
1. Open Google Play Store
2. Search: SAMILA WMS
3. Tap Install
4. Wait for installation
5. Tap Open
```

### **iPhone/iPad**

#### **App Store**
```
1. Open App Store
2. Search: SAMILA WMS
3. Tap Get
4. Authenticate with Face ID/Touch ID
5. Wait for installation
6. Tap Open
```

---

## 🐛 **TROUBLESHOOTING**

### **Installation Issues**

#### **Issue: Installer won't run**
```
Solution:
1. Run as Administrator
2. Disable antivirus temporarily
3. Check Windows Defender settings
4. Verify disk space (50 GB)
```

#### **Issue: Database connection failed**
```
Solution:
1. Verify PostgreSQL is running
2. Check credentials in .env
3. Test connection: psql -h localhost -U samila
4. Check firewall settings
```

#### **Issue: Frontend won't load**
```
Solution:
1. Check if Node.js is installed
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart npm server
4. Check API connection (F12 Console)
```

#### **Issue: Backend API not responding**
```
Solution:
1. Check if Python is running
2. Check port 8000 is not in use
3. Verify .env configuration
4. Check database migrations: alembic current
```

### **Common Errors**

#### **Error: "Module not found"**
```
Solution:
pip install -r requirements.txt
npm install
```

#### **Error: "Port already in use"**
```
Solution:
# Find process using port
netstat -ano | findstr :3000
# Kill process
taskkill /PID <PID> /F
```

#### **Error: "Database password incorrect"**
```
Solution:
1. Reset PostgreSQL password:
   psql -U postgres
   ALTER USER samila PASSWORD 'newpassword';
2. Update .env file
3. Restart services
```

---

## ⚡ **QUICK START COMMANDS**

### **Windows (.bat files)**
```batch
# Install everything
install_all.bat

# Start all services
start_all.bat

# Run database migration
migrate_database.bat

# Check system status
check_status.bat

# Stop all services
stop_all.bat
```

### **Linux/Mac (.sh files)**
```bash
# Install everything
./setup.sh

# Start all services
./start_all.sh

# Run database migration
./migrate_database.sh

# Check system status
./check_status.sh
```

---

## 🔐 **SECURITY CONFIGURATION**

### **Step 1: Change Default Passwords**
```
Admin Password:     Change from admin123
Database Password:  Use secure password
API Key:           Generate new key
JWT Secret:        Generate new secret
```

### **Step 2: Configure SSL/HTTPS**
```
1. Generate SSL certificate
2. Configure in app settings
3. Update URLs to HTTPS
4. Enable HSTS headers
```

### **Step 3: Set Up Firewall**
```
Allow incoming:
- Port 3000 (Frontend)
- Port 8000 (Backend API)
- Port 5432 (Database - internal only)

Block:
- All other ports (except SSH)
```

### **Step 4: Enable Backups**
```
Settings > Backup
├── Schedule: Daily
├── Time: 2:00 AM
├── Retention: 30 days
└── Location: External drive
```

---

## ✅ **INSTALLATION VERIFICATION**

### **Checklist:**
```
☑️ System requirements met
☑️ Installer downloaded
☑️ Installation completed
☑️ Services running
☑️ Database initialized
☑️ Admin account created
☑️ Master data imported
☑️ Tariff configured
☑️ Mobile app installed
☑️ SSL/HTTPS configured
☑️ Backups enabled
☑️ Shortcuts created
☑️ Documentation reviewed
☑️ Team trained
```

---

## 📞 **SUPPORT**

### **Installation Help:**
```
Email:      install-support@samila-wms.com
Phone:      +66-XXX-XXXX
Chat:       https://support.samila-wms.com
Docs:       https://docs.samila-wms.com
GitHub:     https://github.com/samila-wms/samila-wms
```

### **Common Issues Hotline:**
```
Hours:      8 AM - 6 PM (Thailand Time)
Response:   Within 1 hour
```

---

## 🎉 **INSTALLATION COMPLETE!**

**Your SAMILA WMS is now ready to use!**

```
✅ Backend Server Running
✅ Frontend Application Ready
✅ Database Configured
✅ Mobile App Installed
✅ Logo & Shortcuts Created
✅ Documentation Available
```

**Next Steps:**
1. Login to http://localhost:3000
2. Review User Manual
3. Import your data
4. Configure tariffs
5. Train your team
6. Go live!

---

**Version**: 1.0.0  
**Date**: 2026-03-03  
**Status**: Production Ready ✅

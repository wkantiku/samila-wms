#!/bin/bash

# SAMILA WMS - Linux/macOS Shortcut Creator
# วิธีใช้: bash setup-shortcuts.sh
# หรือ: chmod +x setup-shortcuts.sh && ./setup-shortcuts.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="SAMILA WMS"
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8000"
ICON_PATH="./assets/samila_logo.png"

echo -e "${YELLOW}=== SAMILA WMS Shortcut Setup ===${NC}"
echo ""

# Detect OS
OS_TYPE="$(uname -s)"

case "${OS_TYPE}" in
    Linux*)
        echo -e "${GREEN}✓ Detected: Linux${NC}"
        setup_linux
        ;;
    Darwin*)
        echo -e "${GREEN}✓ Detected: macOS${NC}"
        setup_macos
        ;;
    *)
        echo -e "${RED}✗ Unsupported OS: ${OS_TYPE}${NC}"
        exit 1
        ;;
esac

# Linux Setup
setup_linux() {
    echo ""
    echo "Setting up Linux Desktop Shortcut..."
    
    # Create .desktop file
    DESKTOP_DIR="$HOME/.local/share/applications"
    DESKTOP_FILE="$DESKTOP_DIR/samila-wms.desktop"
    
    mkdir -p "$DESKTOP_DIR"
    
    cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=$APP_NAME
Comment=Warehouse Management System
Exec=xdg-open $FRONTEND_URL
Icon=samila_logo
Terminal=false
Categories=Utility;WebBrowser;
Keywords=warehouse;management;system;
EOF
    
    # Make executable
    chmod +x "$DESKTOP_FILE"
    
    # Update desktop database
    if command -v update-desktop-database &> /dev/null; then
        update-desktop-database "$DESKTOP_DIR"
        echo -e "${GREEN}✓ Desktop database updated${NC}"
    fi
    
    # Copy to Desktop if available
    if [ -d "$HOME/Desktop" ]; then
        cp "$DESKTOP_FILE" "$HOME/Desktop/SAMILA_WMS.desktop"
        chmod +x "$HOME/Desktop/SAMILA_WMS.desktop"
        echo -e "${GREEN}✓ Shortcut copied to Desktop${NC}"
    fi
    
    echo -e "${GREEN}✓ Linux setup complete!${NC}"
    echo -e "${YELLOW}Shortcut location: $DESKTOP_FILE${NC}"
}

# macOS Setup
setup_macos() {
    echo ""
    echo "Setting up macOS Shortcut..."
    
    # Create .webloc file
    SHORTCUT_FILE="$HOME/Desktop/$APP_NAME.webloc"
    
    cat > "$SHORTCUT_FILE" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>URL</key>
	<string>http://localhost:3000</string>
	<key>Title</key>
	<string>SAMILA WMS</string>
</dict>
</plist>
EOF
    
    echo -e "${GREEN}✓ macOS Shortcut created${NC}"
    echo -e "${YELLOW}Shortcut location: $SHORTCUT_FILE${NC}"
    
    # Add to Dock (optional)
    echo ""
    echo -e "${YELLOW}Do you want to add to Dock? (y/n)${NC}"
    read -r add_dock
    
    if [ "$add_dock" = "y" ]; then
        defaults write com.apple.dock persistent-apps -array-add "<dict><key>tile-data</key><dict><key>file-data</key><dict><key>_CFURLString</key><string>$SHORTCUT_FILE</string><key>_CFURLStringType</key><integer>0</integer></dict></dict></dict>"
        killall Dock
        echo -e "${GREEN}✓ Added to Dock${NC}"
    fi
    
    echo -e "${GREEN}✓ macOS setup complete!${NC}"
}

# Summary
echo ""
echo -e "${GREEN}=== Setup Summary ===${NC}"
echo ""
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL:  $BACKEND_URL"
echo ""
echo -e "${YELLOW}Quick Access:${NC}"
echo "- HTML Dashboard: open SAMILA_WMS.html"
echo "- API Documentation: $BACKEND_URL/api/docs"
echo ""
echo -e "${GREEN}✓ All shortcuts created successfully!${NC}"
echo ""

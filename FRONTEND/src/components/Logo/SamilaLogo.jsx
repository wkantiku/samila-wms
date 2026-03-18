// src/components/Logo/SamilaLogo.jsx
import './SamilaLogo.css';

const LOGO_SRC = '/logo.png';

// ใช้แสดง logo inline เช่น ใน nav/header - แสดงเป็น height คงที่, width auto
export const SamilaLogo = ({ size = 'medium' }) => {
  const heightMap = { small: 28, medium: 40, large: 64 };
  const h = heightMap[size] || 40;

  return (
    <div className={`samila-logo logo-${size}`}>
      <img src={LOGO_SRC} alt="Samila WMS 3PL" height={h} style={{ width: 'auto', objectFit: 'contain', display: 'block' }} />
    </div>
  );
};

// ใช้ใน main sidebar header - แสดง logo ขนาดใหญ่ (row layout, left-aligned)
export const LogoHeader = ({ showText = true }) => {
  return (
    <div className="logo-header">
      <img src={LOGO_SRC} alt="Samila WMS 3PL" className="logo-header-img" />
      {showText && (
        <div className="logo-header-text">
          <p className="logo-header-title">Samila WMS 3PL</p>
          <p className="logo-header-sub">Warehouse Management System</p>
        </div>
      )}
    </div>
  );
};

export const FaviconLogo = () => (
  <img src={LOGO_SRC} alt="Samila WMS 3PL" height={32} style={{ width: 'auto', objectFit: 'contain' }} />
);

export default SamilaLogo;

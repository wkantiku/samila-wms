// src/components/Logo/SamilaLogo.jsx
import './SamilaLogo.css';

const LOGO_SRC = '/logo.png';

export const SamilaLogo = ({ size = 'medium' }) => {
  const sizeMap = { small: 32, medium: 48, large: 72 };
  const px = sizeMap[size] || 48;

  return (
    <div className={`samila-logo logo-${size}`}>
      <img src={LOGO_SRC} alt="BB Innovation" width={px} height={px} style={{ objectFit: 'contain' }} />
    </div>
  );
};

export const LogoHeader = ({ showText = true }) => {
  return (
    <div className="logo-header">
      <img src={LOGO_SRC} alt="BB Innovation" width={56} height={56} style={{ objectFit: 'contain' }} />
      {showText && (
        <div className="logo-text">
          <h1>BB Innovation</h1>
          <p>Warehouse Management System</p>
        </div>
      )}
    </div>
  );
};

export const FaviconLogo = () => (
  <img src={LOGO_SRC} alt="BB Innovation" width={32} height={32} style={{ objectFit: 'contain' }} />
);

export default SamilaLogo;

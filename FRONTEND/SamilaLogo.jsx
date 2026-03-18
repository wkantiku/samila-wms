// src/components/Logo/SamilaLogo.jsx
import React from 'react';
import './SamilaLogo.css';

/**
 * SAMILA Innovation Logo Component
 * Professional mermaid-inspired logo with cyan and gold colors
 * Used throughout the application
 */

export const SamilaLogo = ({ size = 'medium', variant = 'full' }) => {
  const sizeClasses = {
    small: 'logo-small',
    medium: 'logo-medium',
    large: 'logo-large'
  };

  return (
    <div className={`samila-logo ${sizeClasses[size] || sizeClasses.medium}`}>
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        {/* Background (optional) */}
        {variant === 'with-bg' && (
          <circle cx="100" cy="100" r="95" fill="rgba(0, 168, 204, 0.05)" stroke="#00A8CC" strokeWidth="1" opacity="0.3"/>
        )}

        {/* Main Mermaid Body - Cyan */}
        <g id="mermaid-body">
          {/* Head */}
          <circle cx="60" cy="50" r="18" fill="#00BCD4"/>
          <path d="M 55 35 Q 50 25 55 15 Q 60 20 65 15 Q 70 25 65 35" fill="#00BCD4"/>

          {/* Upper Body */}
          <ellipse cx="70" cy="75" rx="20" ry="25" fill="#00A8CC"/>

          {/* Tail - Flowing gradient effect */}
          <path d="M 85 80 Q 110 70 130 60 Q 140 55 150 50" 
                stroke="#FFD700" strokeWidth="8" fill="none" strokeLinecap="round"/>
          <path d="M 85 85 Q 115 85 135 75 Q 145 70 155 65" 
                stroke="#FFD700" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.8"/>
          <path d="M 82 90 Q 112 100 135 95 Q 148 92 160 85" 
                stroke="#C4A747" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.7"/>

          {/* Water splashes - Lower */}
          <path d="M 45 110 Q 48 125 42 135" stroke="#00BCD4" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <path d="M 55 115 Q 58 130 52 140" stroke="#00BCD4" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8"/>

          {/* Hair flowing effect */}
          <path d="M 60 35 Q 40 40 35 55" stroke="#00BCD4" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M 65 32 Q 45 35 40 50" stroke="#00A8CC" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8"/>
        </g>

        {/* Decorative sparkles */}
        <g id="sparkles">
          <circle cx="155" cy="40" r="2.5" fill="#FFD700"/>
          <circle cx="165" cy="50" r="2" fill="#FFD700" opacity="0.7"/>
          <circle cx="120" cy="140" r="1.5" fill="#FFD700" opacity="0.6"/>
        </g>

        {/* Text - Optional */}
        {variant === 'full' && (
          <g id="text" textAnchor="middle">
            <text x="100" y="180" fontSize="14" fontWeight="bold" fill="#FFD700" 
                  fontFamily="Arial, sans-serif" letterSpacing="1">
              SAMILA
            </text>
            <text x="100" y="194" fontSize="10" fill="#00A8CC" 
                  fontFamily="Arial, sans-serif">
              INNOVATION
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

/**
 * Logo Header Component
 * Used in app header with title
 */
export const LogoHeader = ({ showText = true }) => {
  return (
    <div className="logo-header">
      <SamilaLogo size="medium" variant="icon"/>
      {showText && (
        <div className="logo-text">
          <h1>SAMILA</h1>
          <p>Warehouse Management System</p>
        </div>
      )}
    </div>
  );
};

/**
 * Favicon Logo Component
 * Small version for browser tabs
 */
export const FaviconLogo = () => {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
      {/* Simplified mermaid for favicon */}
      <circle cx="100" cy="100" r="95" fill="#00A8CC"/>
      <circle cx="60" cy="50" r="12" fill="#00BCD4"/>
      <ellipse cx="70" cy="75" rx="12" ry="15" fill="#FFFFFF" opacity="0.8"/>
      <path d="M 85 75 Q 115 65 140 55" stroke="#FFD700" strokeWidth="5" fill="none" strokeLinecap="round"/>
    </svg>
  );
};

export default SamilaLogo;

import React from 'react';
import logo from '../../assets/nemesis.svg';
import styles from './Logo.module.css';

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  alt = 'Nemesis Logo' 
}: LogoProps) => {
  return (
    <img 
      src={logo} 
      alt={alt}
      className={`${styles.logo} ${className}`}
    />
  );
}

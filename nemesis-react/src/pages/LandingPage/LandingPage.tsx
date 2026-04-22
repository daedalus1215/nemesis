import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Landing } from './components/Landing';
import styles from './LandingPage.module.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.landingPage}>
      <Landing navigate={navigate} />
    </div>
  );
}; 
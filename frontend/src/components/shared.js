import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import styles from '../styles/components.module.css';

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return children;
};

export const Alert = ({ type, message, onClose }) => {
  if (!message) return null;

  const alertClass = `${styles.alert} ${styles[`alert-${type}`]}`;

  return (
    <div className={alertClass} role="alert">
      <div className={styles['alert-content']}>
        <span>{message}</span>
        <button
          className={styles['alert-close']}
          onClick={onClose}
          aria-label="Close alert"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const LoadingSpinner = () => (
  <div className={styles['spinner-container']}>
    <div className={styles.spinner}></div>
    <p>Loading...</p>
  </div>
);

export const EmptyState = ({ message = 'No data found' }) => (
  <div className={styles['empty-state']}>
    <p>{message}</p>
  </div>
);

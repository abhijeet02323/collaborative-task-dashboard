import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Alert } from './shared';
import styles from '../styles/auth.module.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    
    if (result.success) {
      setAlertMessage(null);
      navigate('/dashboard');
    } else {
      setAlertMessage(result.error);
    }
  };

  return (
    <div className={styles['auth-container']}>
      <div className={styles['auth-card']}>
        <h1>Login</h1>
        <Alert type="error" message={alertMessage} onClose={() => setAlertMessage(null)} />
        
        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" disabled={loading} className={styles['btn-submit']}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className={styles['auth-link']}>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('error');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAlertType('error');
      setAlertMessage('Passwords do not match');
      return;
    }

    const result = await register(firstName, lastName, email, password);
    
    if (result.success) {
      setAlertType('success');
      setAlertMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setAlertType('error');
      setAlertMessage(result.error);
    }
  };

  return (
    <div className={styles['auth-container']}>
      <div className={styles['auth-card']}>
        <h1>Register</h1>
        <Alert 
          type={alertType} 
          message={alertMessage} 
          onClose={() => setAlertMessage(null)} 
        />
        
        <form onSubmit={handleSubmit}>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="John"
              />
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Doe"
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimum 8 characters with uppercase and numbers"
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter your password"
            />
          </div>

          <button type="submit" disabled={loading} className={styles['btn-submit']}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className={styles['auth-link']}>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

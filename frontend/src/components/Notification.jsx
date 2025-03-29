import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import styles from '../styles/partials/notification.module.css'; // Updated import

const Notification = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <div className={styles.notificationIcon}>
        {icons[type]}
      </div>
      <div className={styles.notificationContent}>
        <span>{message}</span>
      </div>
      <button onClick={onClose} className={styles.notificationClose}>
        <X size={18} />
      </button>
    </div>
  );
};

export default Notification;
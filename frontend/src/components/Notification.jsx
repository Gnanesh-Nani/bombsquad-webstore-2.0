import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import '../styles/partials/notification.css';

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
    }, 5000); // Increased to 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type}`}>
      <div className="notification-icon">
        {icons[type]}
      </div>
      <div className="notification-content">
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="notification-close">
        <X size={18} />
      </button>
    </div>
  );
};

export default Notification;
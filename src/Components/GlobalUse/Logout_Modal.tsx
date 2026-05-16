import React from 'react';
import ConfirmationModal from './ConfirmationModal';

interface LogoutModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  title = "Maglog-out?",
  message = "Sigurado ka ba na gusto mong maglog-out?",
  cancelText = "Bumalik",
  confirmText = "Maglog-out"
}) => {
  return (
    <ConfirmationModal
      visible={visible}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={title}
      message={message}
      cancelText={cancelText}
      confirmText={confirmText}
      type="primary"
    />
  );
};

export default LogoutModal;

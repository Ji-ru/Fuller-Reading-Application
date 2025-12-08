import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import user from '../../ui/UserStyle';

interface LogoutModalProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    cancelText?: string;
    confirmText?: string;
  }

const LogoutModal:  React.FC<LogoutModalProps> = ({ 
  visible, 
  onCancel, 
  onConfirm, 
  title = "Logout",
  message = "Are you sure you want to logout?",
  cancelText = "Cancel",
  confirmText = "Logout"
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={user.modalOverlay}>
        <View style={user.modalContainer}>
          <Text style={user.modalTitle}>{title}</Text>
          <Text style={user.modalMessage}>{message}</Text>
          <View style={user.modalButtonContainer}>
            <TouchableOpacity 
              style={[user.modalButton, user.cancelButton]} 
              onPress={onCancel}
            >
              <Text style={user.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[user.modalButton, user.logoutButton]} 
              onPress={onConfirm}
            >
              <Text style={user.logoutButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;
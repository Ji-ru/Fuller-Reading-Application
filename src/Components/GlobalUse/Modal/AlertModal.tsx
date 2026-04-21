import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { sw, sh, sf } from '../../../Utils/responsive';
import buttons from '../../../UI_Designs/ButtonStyles';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
}

export default function AlertModal({
  visible,
  title,
  message,
  onClose,
  confirmText,
  onConfirm,
  cancelText,
}: AlertModalProps) {
  const isConfirmMode = Boolean(cancelText);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.messageText}>{message}</Text>
          
          <View style={isConfirmMode ? styles.buttonContainerRow : styles.buttonContainerColumn}>
            {isConfirmMode && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.confirmButton, isConfirmMode && { flex: 1.2 }]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>{confirmText || 'Okay'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: sw(20),
  },
  modalContainer: {
    width: '100%',
    maxWidth: sw(320),
    backgroundColor: '#FFFFFF',
    borderRadius: sw(20),
    padding: sw(24),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  titleText: {
    fontSize: sf(22),
    fontFamily: 'Satoshi-Bold',
    color: '#1E1E1E',
    marginBottom: sh(10),
    textAlign: 'center',
  },
  messageText: {
    fontSize: sf(15),
    fontFamily: 'Satoshi-Medium',
    color: '#666666',
    textAlign: 'center',
    marginBottom: sh(24),
    lineHeight: sh(22),
  },
  buttonContainerColumn: {
    width: '100%',
  },
  buttonContainerRow: {
    flexDirection: 'row',
    width: '100%',
    gap: sw(12),
  },
  button: {
    paddingVertical: sh(12),
    borderRadius: sw(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sh(48),
  },
  confirmButton: {
    backgroundColor: '#3B7FC9',
    width: '100%',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    flex: 1,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: sf(16),
    fontFamily: 'Satoshi-Bold',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: sf(16),
    fontFamily: 'Satoshi-Bold',
  },
});

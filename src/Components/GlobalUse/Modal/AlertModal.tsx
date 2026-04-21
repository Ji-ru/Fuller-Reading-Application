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
}

export default function AlertModal({
  visible,
  title,
  message,
  onClose,
}: AlertModalProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header Icon / Title */}
          <Text style={styles.titleText}>{title}</Text>
          
          {/* Body Message */}
          <Text style={styles.messageText}>{message}</Text>
          
          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>Okay</Text>
          </TouchableOpacity>
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
    // Shadow
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
  closeButton: {
    backgroundColor: '#2CA96A',
    width: '100%',
    paddingVertical: sh(12),
    borderRadius: sw(12),
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: sf(16),
    fontFamily: 'Satoshi-Bold',
  },
});

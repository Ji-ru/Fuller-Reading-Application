import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { sw, sh, sf } from '../../../Utils/responsive';

export interface ActionOption {
  text: string;
  onPress: () => void;
  isCancel?: boolean;
}

interface ActionSheetModalProps {
  visible: boolean;
  title: string;
  message?: string;
  options: ActionOption[];
  onClose: () => void;
}

export default function ActionSheetModal({
  visible,
  title,
  message,
  options,
  onClose,
}: ActionSheetModalProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header Title */}
          <Text style={styles.titleText}>{title}</Text>

          {/* Optional Message */}
          {message ? <Text style={styles.messageText}>{message}</Text> : null}

          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  option.isCancel && styles.cancelButton,
                  index === options.length - 1 && { marginBottom: 0 }
                ]}
                onPress={() => {
                  option.onPress();
                  onClose();
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionText,
                    option.isCancel && styles.cancelText
                  ]}
                >
                  {option.text}
                </Text>
              </TouchableOpacity>
            ))}
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
    fontSize: sf(18),
    fontFamily: 'Satoshi-Bold',
    color: '#1E1E1E',
    marginBottom: sh(8),
    textAlign: 'center',
  },
  messageText: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Medium',
    color: '#666666',
    textAlign: 'center',
    marginBottom: sh(20),
  },
  optionsContainer: {
    width: '100%',
    marginTop: sh(10),
  },
  optionButton: {
    backgroundColor: '#F5F7FF',
    width: '100%',
    paddingVertical: sh(14),
    borderRadius: sw(12),
    alignItems: 'center',
    marginBottom: sh(10),
    borderWidth: 1,
    borderColor: '#D0DAFB',
  },
  cancelButton: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFD6D6',
  },
  optionText: {
    color: '#3D71D9',
    fontSize: sf(15),
    fontFamily: 'Satoshi-Bold',
  },
  cancelText: {
    color: '#E03131',
  },
});

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { sw, sh, sf } from '../../../Utils/responsive';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
}

// ─── Theme resolver ───────────────────────────────────────────────────────────
type ModalTheme = 'success' | 'error' | 'warning' | 'default';

function resolveTheme(title: string): ModalTheme {
  const t = title.toLowerCase();
  if (t.includes('success') || t.includes('updated') || t.includes('saved') || t.includes('done'))
    return 'success';
  if (t.includes('error') || t.includes('failed') || t.includes('invalid') || t.includes('denied'))
    return 'error';
  if (t.includes('warning') || t.includes('caution') || t.includes('already'))
    return 'warning';
  return 'default';
}

const THEME = {
  success: {
    iconBg:      '#F0FDF4',
    iconBorder:  '#BBF7D0',
    emoji:       '✅',
    titleColor:  '#14532D',
    btnBg:       '#16a34a',
    btnShadow:   '#15803d',
  },
  error: {
    iconBg:      '#FFF0F0',
    iconBorder:  '#FECACA',
    emoji:       '❌',
    titleColor:  '#7F1D1D',
    btnBg:       '#DC2626',
    btnShadow:   '#B91C1C',
  },
  warning: {
    iconBg:      '#FFFBEB',
    iconBorder:  '#FDE68A',
    emoji:       '⚠️',
    titleColor:  '#78350F',
    btnBg:       '#D97706',
    btnShadow:   '#B45309',
  },
  default: {
    iconBg:      '#EFF6FF',
    iconBorder:  '#BFDBFE',
    emoji:       'ℹ️',
    titleColor:  '#1E3A5F',
    btnBg:       '#3B7FC9',
    btnShadow:   '#2563EB',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
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
  const theme = THEME[resolveTheme(title)];

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    else onClose();
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>

          {/* Icon circle */}
          <View style={[styles.iconCircle, { backgroundColor: theme.iconBg, borderColor: theme.iconBorder }]}>
            <Text style={styles.iconEmoji}>{theme.emoji}</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.titleColor }]}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={isConfirmMode ? styles.rowButtons : styles.colButtons}>
            {isConfirmMode && (
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.btn,
                styles.confirmBtn,
                { backgroundColor: theme.btnBg, shadowColor: theme.btnShadow },
                isConfirmMode && { flex: 1.2 },
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>{confirmText || 'Okay'}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: sw(28),
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: sw(24),
    paddingHorizontal: sw(28),
    paddingTop: sh(32),
    paddingBottom: sh(28),
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(8) },
    shadowOpacity: 0.15,
    shadowRadius: sw(20),
  },

  // Icon
  iconCircle: {
    width: sw(72),
    height: sw(72),
    borderRadius: sw(36),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sh(20),
  },
  iconEmoji: {
    fontSize: sf(34),
  },

  // Text
  title: {
    fontSize: sf(22),
    fontFamily: 'Nunito-Black',
    marginBottom: sh(10),
    textAlign: 'center',
  },
  message: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Medium',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: sf(22),
    marginBottom: sh(28),
  },

  // Buttons
  colButtons: {
    width: '100%',
  },
  rowButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: sw(12),
  },
  btn: {
    paddingVertical: sh(14),
    borderRadius: sw(14),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sh(50),
  },
  confirmBtn: {
    width: '100%',
    flex: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: sw(3) },
    shadowOpacity: 0.25,
    shadowRadius: sw(6),
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: sf(16),
    fontFamily: 'Nunito-Bold',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelBtnText: {
    color: '#6B7280',
    fontSize: sf(16),
    fontFamily: 'Nunito-Bold',
  },
});